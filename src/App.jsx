import { useState, useEffect, useCallback, useRef } from 'react';
import GistSetup from './components/GistSetup.jsx';
import OverviewTab from './components/OverviewTab.jsx';
import TodoTab from './components/TodoTab.jsx';
import TimelineTab from './components/TimelineTab.jsx';
import VendorsTab from './components/VendorsTab.jsx';
import VenueTab from './components/VenueTab.jsx';
import BudgetTab from './components/BudgetTab.jsx';
import EventsTab from './components/EventsTab.jsx';
import VisionTab from './components/VisionTab.jsx';
import { useLocalState } from './components/plan/ui.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { TRACKS, findTask } from './data/plan.js';
import { loadData, saveData, getInitialData, migrateData } from './data/storage.js';
import {
  getCredentials, saveCredentials, clearCredentials,
  loadFromGist, saveToGist,
  setPending, clearPending, hasPending,
  isGuestMode, setGuestMode, clearGuestMode,
} from './data/gistStorage.js';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'todo', label: 'To do' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'venue', label: 'Venue' },
  { id: 'budget', label: 'Budget' },
  { id: 'events', label: 'Events' },
  { id: 'vision', label: 'Vision' },
];

// '#todo-design' style hashes pick a To do section; plain names pick a tab.
function parseHash() {
  const h = window.location.hash.slice(1);
  if (h.startsWith('todo-') && TRACKS.some(t => t.id === h.slice(5))) return { tab: 'todo', track: h.slice(5) };
  return { tab: TABS.some(t => t.id === h) ? h : 'overview', track: null };
}

const SYNC_DEBOUNCE_MS = 5 * 60 * 1000;

export default function App() {
  const [credentials, setCredentials] = useState(() => getCredentials());
  const [guestMode, setGuestModeState] = useState(() => isGuestMode());
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(() => parseHash().tab);
  const [track, setTrack] = useLocalState('track', 'design');
  const [expanded, setExpanded] = useLocalState('open', []);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState('');
  const [conflictData, setConflictData] = useState(null);

  const saveTimer = useRef(null);
  const credentialsRef = useRef(credentials);

  useEffect(() => { credentialsRef.current = credentials; }, [credentials]);

  // Countdown to the wedding (local midnight)
  const [wy, wm, wd] = (data?.weddingDate || '2027-05-23').split('-').map(Number);
  const now = new Date();
  const daysUntil = Math.round((new Date(wy, wm - 1, wd) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);

  // Navigation
  useEffect(() => {
    const h = parseHash();
    if (h.track) setTrack(h.track);
    const onHash = () => { const p = parseHash(); setTab(p.tab); if (p.track) setTrack(p.track); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setHash = h => { try { window.history.replaceState(null, '', '#' + h); } catch { /* ignore */ } };
  const goTab = useCallback(id => { setTab(id); setHash(id === 'todo' ? 'todo-' + track : id); window.scrollTo(0, 0); }, [track]);
  const goTrack = useCallback(id => { setTrack(id); setTab('todo'); setHash('todo-' + id); }, [setTrack]);
  const scrollToId = id => setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: 'center' }); }, 50);
  const toast = useCallback(msg => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
  }, []);

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

  const api = {
    data, updateData, track, expanded, toast, goTab, goTrack,
    toggleExpand: id => setExpanded(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])),
    collapse: id => setExpanded(list => list.filter(x => x !== id)),
    openInTodo: id => {
      const t = data && findTask(data, id); if (!t) return;
      setExpanded(list => (list.includes(id) ? list : [...list, id]));
      goTrack(t.track);
      scrollToId('td-' + id);
    },
    goVendor: vid => { setTab('vendors'); setHash('vendors'); scrollToId('v-' + vid); },
  };

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
          <h1>The Wedding, <em>May 23, 2027</em></h1>
          <div className="subtitle">Sunday · Seventh/Place, Arts District DTLA · 75–85 guests</div>
        </div>
        <div className="header-right">
          <div className="sync-status">{renderSyncStatus()}</div>
          <div>
            <div className="countdown">{daysUntil > 0 ? daysUntil.toLocaleString() : daysUntil === 0 ? 'Today' : '—'}</div>
            <div className="countdown-label">{daysUntil > 0 ? `days to go · ${Math.floor(daysUntil / 7)} weeks` : daysUntil === 0 ? 'wedding day' : 'married'}</div>
          </div>
          <ThemeToggle />
          <button className="settings-btn" onClick={handleDisconnect} title="Settings">⚙</button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => goTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="main">
        {tab === 'vision' ? <VisionTab data={data} updateData={updateData} /> : (
          <div className="wp">
            {tab === 'overview' && <OverviewTab api={api} />}
            {tab === 'todo' && <TodoTab api={api} />}
            {tab === 'timeline' && <TimelineTab api={api} />}
            {tab === 'vendors' && <VendorsTab api={api} />}
            {tab === 'venue' && <VenueTab api={api} />}
            {tab === 'budget' && <BudgetTab api={api} />}
            {tab === 'events' && <EventsTab api={api} />}
          </div>
        )}
        {toastMsg && <div className="wp"><div className="toast" role="status">{toastMsg}</div></div>}
      </div>
    </>
  );
}
