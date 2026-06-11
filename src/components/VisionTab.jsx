import { useState } from 'react';
import { Modal, ModalField } from './shared.jsx';
import { generateId } from '../data/defaults.js';

function slidesShareToEmbed(url) {
  const m = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) return null;
  return `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`;
}

export default function VisionTab({ data, updateData }) {
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState({});

  const visions = data?.visions || [];
  const activeVision = visions.find(v => v.id === data?.activeVisionId) || visions[0];

  const switchVision = (id) => {
    updateData(prev => ({ ...prev, activeVisionId: id }));
  };

  const addVision = () => {
    setModal('addVision');
    setModalData({ name: '' });
  };

  const confirmAddVision = () => {
    if (!modalData.name?.trim()) return;
    const newVision = {
      id: generateId(),
      name: modalData.name.trim(),
      moodboards: [],
      pinterest: [],
      inspo: [],
      keywords: [],
      notes: '',
    };
    updateData(prev => ({
      ...prev,
      visions: [...prev.visions, newVision],
      activeVisionId: newVision.id,
    }));
    setModal(null);
  };

  const renameVision = (id) => {
    const vision = visions.find(v => v.id === id);
    if (!vision) return;
    setModal('renameVision');
    setModalData({ id, name: vision.name });
  };

  const confirmRenameVision = () => {
    if (!modalData.name?.trim()) return;
    updateData(prev => ({
      ...prev,
      visions: prev.visions.map(v =>
        v.id === modalData.id ? { ...v, name: modalData.name.trim() } : v
      ),
    }));
    setModal(null);
  };

  const deleteVision = (id) => {
    if (visions.length <= 1) return;
    if (!confirm('Delete this vision concept?')) return;
    updateData(prev => {
      const newVisions = prev.visions.filter(v => v.id !== id);
      return {
        ...prev,
        visions: newVisions,
        activeVisionId: prev.activeVisionId === id ? newVisions[0].id : prev.activeVisionId,
      };
    });
  };

  const updateVisionField = (field, value) => {
    updateData(prev => ({
      ...prev,
      visions: prev.visions.map(v =>
        v.id === data.activeVisionId ? { ...v, [field]: value } : v
      ),
    }));
  };

  // Add moodboard
  const addMoodboard = () => {
    setModal('addMoodboard');
    setModalData({ url: '', label: '' });
  };

  const confirmAddMoodboard = () => {
    const embedUrl = slidesShareToEmbed(modalData.url || '');
    if (!embedUrl) {
      alert('Paste a valid Google Slides URL containing /presentation/d/');
      return;
    }
    const newBoard = { id: generateId(), src: embedUrl, label: modalData.label || 'Mood Board' };
    updateVisionField('moodboards', [...(activeVision.moodboards || []), newBoard]);
    setModal(null);
  };

  const removeMoodboard = (id) => {
    updateVisionField('moodboards', activeVision.moodboards.filter(m => m.id !== id));
  };

  // Add pinterest
  const addPinterest = () => {
    setModal('addPinterest');
    setModalData({ url: '', label: '' });
  };

  const confirmAddPinterest = () => {
    if (!modalData.url?.trim()) return;
    const newPin = { id: generateId(), url: modalData.url.trim(), label: modalData.label || 'Pinterest Board' };
    updateVisionField('pinterest', [...(activeVision.pinterest || []), newPin]);
    setModal(null);
  };

  const removePinterest = (id) => {
    updateVisionField('pinterest', activeVision.pinterest.filter(p => p.id !== id));
  };

  // Add inspiration link
  const addInspo = () => {
    setModal('addInspo');
    setModalData({ url: '', label: '' });
  };

  const confirmAddInspo = () => {
    if (!modalData.url?.trim()) return;
    const newInspo = { id: generateId(), url: modalData.url.trim(), label: modalData.label || modalData.url };
    updateVisionField('inspo', [...(activeVision.inspo || []), newInspo]);
    setModal(null);
  };

  const removeInspo = (id) => {
    updateVisionField('inspo', activeVision.inspo.filter(i => i.id !== id));
  };

  // Add keyword
  const addKeyword = () => {
    setModal('addKeyword');
    setModalData({ keyword: '' });
  };

  const confirmAddKeyword = () => {
    if (!modalData.keyword?.trim()) return;
    updateVisionField('keywords', [...(activeVision.keywords || []), modalData.keyword.trim()]);
    setModal(null);
  };

  const removeKeyword = (kw) => {
    updateVisionField('keywords', activeVision.keywords.filter(k => k !== kw));
  };

  const shortUrl = (url) => url.replace(/^https?:\/\//, '').substring(0, 60);

  return (
    <>
      <div className="vision-header-row">
        <div>
          <h2 className="section-heading">Vision & Inspiration</h2>
          <p className="section-desc">Explore multiple distinct concepts — switch between them using the tabs below</p>
        </div>
        <button className="btn btn-outline" onClick={addVision}>+ New Vision</button>
      </div>

      <div className="vision-tab-bar">
        {visions.map(vision => (
          <button
            key={vision.id}
            className={`vision-concept-tab ${vision.id === data.activeVisionId ? 'active' : ''}`}
            onClick={() => switchVision(vision.id)}
          >
            <span>{vision.name}</span>
            <button className="vtab-btn" onClick={(e) => { e.stopPropagation(); renameVision(vision.id); }} title="Rename">✎</button>
            {visions.length > 1 && (
              <button className="vtab-btn" onClick={(e) => { e.stopPropagation(); deleteVision(vision.id); }} title="Delete">✕</button>
            )}
          </button>
        ))}
      </div>

      {activeVision && (
        <>
          {/* Mood Boards */}
          <div className="vision-block">
            <div className="vision-block-header">
              <div className="vision-block-title">Mood Boards</div>
              <button className="btn btn-outline" onClick={addMoodboard}>+ Add Slides URL</button>
            </div>
            {(!activeVision.moodboards || activeVision.moodboards.length === 0) ? (
              <div className="embed-placeholder">
                <div className="embed-placeholder-icon">⊞</div>
                <div className="embed-placeholder-text">No mood board added yet</div>
                <div className="embed-placeholder-sub">Paste a public Google Slides share link — it will embed here</div>
              </div>
            ) : (
              <div className="slides-list">
                {activeVision.moodboards.map(mb => (
                  <div key={mb.id} className="slide-embed-item">
                    <iframe src={mb.src} frameBorder="0" allowFullScreen />
                    <div className="slide-embed-label">
                      <span>{mb.label}</span>
                      <button className="icon-btn" onClick={() => removeMoodboard(mb.id)}>✕ Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pinterest Boards */}
          <div className="vision-block">
            <div className="vision-block-header">
              <div className="vision-block-title">Pinterest Boards</div>
              <button className="btn btn-outline" onClick={addPinterest}>+ Add Board</button>
            </div>
            {(!activeVision.pinterest || activeVision.pinterest.length === 0) ? (
              <div className="embed-placeholder">
                <div className="embed-placeholder-icon">⊞</div>
                <div className="embed-placeholder-text">No Pinterest boards linked yet</div>
                <div className="embed-placeholder-sub">Add a Pinterest board URL to link it here</div>
              </div>
            ) : (
              <div className="link-card-list">
                {activeVision.pinterest.map(pin => (
                  <div key={pin.id} className="link-card">
                    <div className="link-card-icon">⊞</div>
                    <div className="link-card-body">
                      <div className="link-card-label">{pin.label}</div>
                      <div className="link-card-url">{shortUrl(pin.url)}</div>
                    </div>
                    <div className="link-card-actions">
                      <a href={pin.url} target="_blank" rel="noreferrer">↗ Open Board</a>
                      <button className="icon-btn" onClick={() => removePinterest(pin.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspiration Links */}
          <div className="vision-block">
            <div className="vision-block-header">
              <div className="vision-block-title">Inspiration Links</div>
              <button className="btn btn-outline" onClick={addInspo}>+ Add Link</button>
            </div>
            {(!activeVision.inspo || activeVision.inspo.length === 0) ? (
              <div className="embed-placeholder">
                <div className="embed-placeholder-icon">⊞</div>
                <div className="embed-placeholder-text">No inspiration links yet</div>
                <div className="embed-placeholder-sub">Articles, real weddings, photographer portfolios, venue tours</div>
              </div>
            ) : (
              <div className="link-card-list">
                {activeVision.inspo.map(link => (
                  <div key={link.id} className="link-card">
                    <div className="link-card-icon">↗</div>
                    <div className="link-card-body">
                      <div className="link-card-label">{link.label}</div>
                      <div className="link-card-url">{shortUrl(link.url)}</div>
                    </div>
                    <div className="link-card-actions">
                      <a href={link.url} target="_blank" rel="noreferrer">↗ Open</a>
                      <button className="icon-btn" onClick={() => removeInspo(link.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aesthetic Keywords */}
          <div className="vision-block">
            <div className="vision-block-header">
              <div className="vision-block-title">Aesthetic Keywords</div>
              <button className="btn btn-outline" onClick={addKeyword}>+ Add Word</button>
            </div>
            {(!activeVision.keywords || activeVision.keywords.length === 0) ? (
              <div className="embed-placeholder">
                <div className="embed-placeholder-icon">✦</div>
                <div className="embed-placeholder-text">No keywords yet</div>
                <div className="embed-placeholder-sub">e.g. "warm", "organic", "candlelit", "modern", "editorial", "unfussy"</div>
              </div>
            ) : (
              <div className="keyword-tag-list">
                {activeVision.keywords.map((kw, i) => (
                  <div key={i} className="keyword-tag">
                    <span>{kw}</span>
                    <button onClick={() => removeKeyword(kw)} title="Remove">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vision Notes */}
          <div className="vision-block">
            <div className="vision-block-header">
              <div className="vision-block-title">Vision Notes</div>
            </div>
            <textarea
              className="vision-textarea"
              value={activeVision.notes || ''}
              onChange={e => updateVisionField('notes', e.target.value)}
              placeholder="What you want guests to feel, things to avoid, specific moments that matter..."
            />
          </div>
        </>
      )}

      {/* Modals */}
      {modal === 'addVision' && (
        <Modal title="New Vision Concept" onClose={() => setModal(null)} onConfirm={confirmAddVision}>
          <ModalField label="Concept Name">
            <input
              className="modal-input"
              value={modalData.name || ''}
              onChange={e => setModalData({ ...modalData, name: e.target.value })}
              placeholder="e.g. Nature, Abstract, Candlelit Garden..."
              autoFocus
            />
          </ModalField>
        </Modal>
      )}

      {modal === 'renameVision' && (
        <Modal title="Rename Vision" onClose={() => setModal(null)} onConfirm={confirmRenameVision} confirmText="Save">
          <ModalField label="New Name">
            <input
              className="modal-input"
              value={modalData.name || ''}
              onChange={e => setModalData({ ...modalData, name: e.target.value })}
              autoFocus
            />
          </ModalField>
        </Modal>
      )}

      {modal === 'addMoodboard' && (
        <Modal title="Add Google Slides Mood Board" onClose={() => setModal(null)} onConfirm={confirmAddMoodboard}>
          <ModalField label="Google Slides Share URL">
            <input
              className="modal-input"
              value={modalData.url || ''}
              onChange={e => setModalData({ ...modalData, url: e.target.value })}
              placeholder="https://docs.google.com/presentation/d/..."
              autoFocus
            />
          </ModalField>
          <ModalField label="Label (optional)">
            <input
              className="modal-input"
              value={modalData.label || ''}
              onChange={e => setModalData({ ...modalData, label: e.target.value })}
              placeholder="e.g. Ceremony Mood Board"
            />
          </ModalField>
        </Modal>
      )}

      {modal === 'addPinterest' && (
        <Modal title="Add Pinterest Board" onClose={() => setModal(null)} onConfirm={confirmAddPinterest}>
          <ModalField label="Pinterest Board URL">
            <input
              className="modal-input"
              value={modalData.url || ''}
              onChange={e => setModalData({ ...modalData, url: e.target.value })}
              placeholder="https://pinterest.com/yourname/board-name/"
              autoFocus
            />
          </ModalField>
          <ModalField label="Label">
            <input
              className="modal-input"
              value={modalData.label || ''}
              onChange={e => setModalData({ ...modalData, label: e.target.value })}
              placeholder="e.g. Florals & Décor"
            />
          </ModalField>
        </Modal>
      )}

      {modal === 'addInspo' && (
        <Modal title="Add Inspiration Link" onClose={() => setModal(null)} onConfirm={confirmAddInspo}>
          <ModalField label="URL">
            <input
              className="modal-input"
              value={modalData.url || ''}
              onChange={e => setModalData({ ...modalData, url: e.target.value })}
              placeholder="https://..."
              autoFocus
            />
          </ModalField>
          <ModalField label="Label / Description">
            <input
              className="modal-input"
              value={modalData.label || ''}
              onChange={e => setModalData({ ...modalData, label: e.target.value })}
              placeholder="e.g. Real wedding at Millwick — earthy palette"
            />
          </ModalField>
        </Modal>
      )}

      {modal === 'addKeyword' && (
        <Modal title="Add Aesthetic Keyword" onClose={() => setModal(null)} onConfirm={confirmAddKeyword}>
          <ModalField label="Word or Phrase">
            <input
              className="modal-input"
              value={modalData.keyword || ''}
              onChange={e => setModalData({ ...modalData, keyword: e.target.value })}
              placeholder="e.g. candlelit, organic, editorial, warm..."
              autoFocus
            />
          </ModalField>
        </Modal>
      )}
    </>
  );
}
