import { useState, useEffect, useCallback, useRef } from 'react';
import GistSetup from './components/GistSetup.jsx';
import OverviewTab from './components/OverviewTab.jsx';
import TimelineTab from './components/TimelineTab.jsx';
import VenuesTab from './components/VenuesTab.jsx';
import BudgetTab from './components/BudgetTab.jsx';
import SatellitesTab from './components/SatellitesTab.jsx';
import VisionTab from './components/VisionTab.jsx';
import { loadData, saveData, getInitialData, migrateData } from './data/storage.js';
import {
  getCredentials, saveCredentials, clearCredentials,
  loadFromGist, saveToGist,
  setPending, clearPending, hasPending,
  isGuestMode, setGuestMode, clearGuestMode,
} from './data/gistStorage.js';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'venues', label: 'Venues' },
  { id: 'budget', label: 'Budget' },
  { id: 'satellites', label: 'Satellite Events' },
  { id: 'vision', label: 'Vision' },
];

const SYNC_DEBOUNCE_MS = 5 * 60 * 1000;

export default function App() {
  const [credentials, setCredentials] = useState(() => getCredentials());
  const [guestMode, setGuestModeState] = useState(() => isGuestMode());
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState('');
  const [conflictData, setConflictData] = useState(null);

  const saveTimer = useRef(null);
  const credentialsRef = useRef(credentials);

  useEffect(() => { credentialsRef.current = credentials; }, [credentials]);

  // Calculate countdown
  const weddingDate = data?.weddingDate ? new Date(data.weddingDate) : new Date('2027-05-15');
  const daysUntil = Math.ceil((weddingDate - new Date()) / (1000 * 60 * 60 * 24));

  // Initial load
  useEffect(() => {
    if (isGuestMode()) {
      const cached = loadData();
      setData(cached || getInitialData());
      setLoading(false);
      return;
    }

    const creds = getCredentials();
    if (!creds) { setLoading(false); return; }

    loadFromGist(creds.token, creds.gistId)
      .then(rawGistData => {
        const gistData = migrateData(rawGistData);
        if (hasPending()) {
          const local = loadData();
          if (local) {
            setConflictData({ gist: gistData, local });
            setLoading(false);
            return;
          }
        }
        clearPending();
        setData(gistData);
        saveData(gistData);
        setLoading(false);
      })
      .catch(err => {
        console.error('[Wedding Planner] Failed to load from gist:', err.message);
        const cached = loadData();
        setData(cached || getInitialData());
        setSyncStatus('error');
        setSyncError(err.message);
        setLoading(false);
      });
  }, []);

  const doGistSave = useCallback(async (nextData) => {
    const creds = credentialsRef.current;
    if (!creds) return;
    setSyncStatus('saving');
    try {
      await saveToGist(creds.token, creds.gistId, nextData);
      clearPending();
      setSyncStatus('saved');
      setSyncError('');
      setTimeout(() => setSyncStatus(s => s === 'saved' ? 'idle' : s), 2000);
    } catch (err) {
      console.error('[Wedding Planner] Failed to save to gist:', err.message);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  }, []);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveData(next);
      if (!isGuestMode() && credentialsRef.current) {
        setPending();
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => doGistSave(next), SYNC_DEBOUNCE_MS);
      }
      return next;
    });
  }, [doGistSave]);

  const handleConnect = useCallback(({ token, gistId, data: initialData }) => {
    saveCredentials(token, gistId);
    credentialsRef.current = { token, gistId };
    setCredentials({ token, gistId });
    setData(initialData);
    saveData(initialData);
    setLoading(false);
  }, []);

  const handleGuest = useCallback(() => {
    setGuestMode();
    setGuestModeState(true);
    const cached = loadData();
    setData(cached || getInitialData());
    setLoading(false);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (!confirm('Disconnect from GitHub? Your data will remain saved locally.')) return;
    clearCredentials();
    clearGuestMode();
    clearPending();
    setCredentials(null);
    setGuestModeState(false);
  }, []);

  const resolveConflict = useCallback((choice) => {
    const chosen = choice === 'local' ? conflictData.local : conflictData.gist;
    clearPending();
    setData(chosen);
    saveData(chosen);
    if (choice === 'local') {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => doGistSave(chosen), 500);
    }
    setConflictData(null);
  }, [conflictData, doGistSave]);

  // Setup screen
  if (!credentials && !guestMode) {
    return <GistSetup onConnect={handleConnect} onGuest={handleGuest} getInitialData={getInitialData} />;
  }

  // Loading
  if (loading || (!conflictData && !data)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'DM Mono, monospace', color: '#999' }}>
        Loading...
      </div>
    );
  }

  // Conflict resolution
  if (conflictData) {
    return (
      <div className="conflict-dialog" style={{ display: 'flex' }}>
        <div className="conflict-box">
          <div className="conflict-title">Unsynced Changes Found</div>
          <p className="conflict-desc">
            Your last session had changes that didn't sync to GitHub. Choose which version to keep.
          </p>
          <button className="conflict-btn conflict-btn-primary" onClick={() => resolveConflict('local')}>
            Keep Local Version
            <div className="conflict-info">Saved: {new Date(conflictData.local.savedAt).toLocaleString()}</div>
          </button>
          <button className="conflict-btn conflict-btn-secondary" onClick={() => resolveConflict('gist')}>
            Load from GitHub
            <div className="conflict-info">Saved: {new Date(conflictData.gist.savedAt).toLocaleString()}</div>
          </button>
        </div>
      </div>
    );
  }

  const renderSyncStatus = () => {
    if (guestMode) return <span style={{ color: '#7a7268', fontSize: 10 }}>Local only</span>;
    if (syncStatus === 'saving') return <span style={{ color: '#7a7268' }}>Syncing...</span>;
    if (syncStatus === 'saved') return <span style={{ color: '#5a8a6a' }}>Saved ✓</span>;
    if (syncStatus === 'error') {
      return (
        <button onClick={() => doGistSave(data)} style={{ background: 'none', border: 'none', color: '#c4614a', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10 }}>
          Sync error — retry
        </button>
      );
    }
    return (
      <button onClick={() => doGistSave(data)} style={{ background: 'none', border: '1px solid #ddd5c4', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: 10, color: '#7a7268', fontFamily: 'inherit' }}>
        ↑ Sync now
      </button>
    );
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>The Wedding — <em>2027</em></h1>
          <div className="subtitle">Los Angeles · 80–100 Guests · April / May 2027</div>
        </div>
        <div className="header-right">
          <div className="sync-status">{renderSyncStatus()}</div>
          <div>
            <div className="countdown">{daysUntil.toLocaleString()}</div>
            <div className="countdown-label">days until target date</div>
          </div>
          <button className="settings-btn" onClick={handleDisconnect} title="Settings">⚙</button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="main">
        {tab === 'overview' && <OverviewTab data={data} updateData={updateData} />}
        {tab === 'timeline' && <TimelineTab data={data} updateData={updateData} />}
        {tab === 'venues' && <VenuesTab data={data} updateData={updateData} />}
        {tab === 'budget' && <BudgetTab data={data} updateData={updateData} />}
        {tab === 'satellites' && <SatellitesTab data={data} updateData={updateData} />}
        {tab === 'vision' && <VisionTab data={data} updateData={updateData} />}
      </div>
    </>
  );
}
