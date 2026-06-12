import { useState, useRef, useCallback } from 'react';
import { Alert } from './shared.jsx';

// Auto-resize textarea helper
function AutoResizeTextarea({ id, value, onChange, className, placeholder, onClick }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback((el) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, []);

  const handleChange = (e) => {
    adjustHeight(e.target);
    onChange(e);
  };

  // Adjust on mount and when value changes
  const setRef = useCallback((el) => {
    textareaRef.current = el;
    if (el) {
      adjustHeight(el);
    }
  }, [adjustHeight]);

  return (
    <textarea
      key={id}
      ref={setRef}
      className={className}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      onClick={onClick}
      rows={1}
    />
  );
}

const STATUS_LABELS = {
  scout: 'To Scout',
  contact: 'Contacted',
  visit: 'Visited',
  booked: 'Booked',
};

export default function VenuesTab({ data, updateData }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const listRef = useRef(null);

  const venues = data?.venues || [];

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    updateData(prev => {
      const venues = [...prev.venues];
      const dragIdx = venues.findIndex(v => v.id === draggedId);
      const targetIdx = venues.findIndex(v => v.id === targetId);

      const [dragged] = venues.splice(dragIdx, 1);
      venues.splice(targetIdx, 0, dragged);

      return { ...prev, venues };
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const updateVenueNotes = (venueId, notes) => {
    updateData(prev => ({
      ...prev,
      venues: prev.venues.map(v =>
        v.id === venueId ? { ...v, userNotes: notes } : v
      ),
    }));
  };

  const updateVenueStatus = (venueId, status) => {
    updateData(prev => ({
      ...prev,
      venues: prev.venues.map(v =>
        v.id === venueId ? { ...v, status } : v
      ),
    }));
  };

  const toggleDeprioritized = (venueId) => {
    updateData(prev => ({
      ...prev,
      venues: prev.venues.map(v =>
        v.id === venueId ? { ...v, deprioritized: !v.deprioritized } : v
      ),
    }));
  };

  const updateGeneralNotes = (notes) => {
    updateData(prev => ({ ...prev, venueNotes: notes }));
  };

  const updateVenueField = (venueId, field, value) => {
    updateData(prev => ({
      ...prev,
      venues: prev.venues.map(v =>
        v.id === venueId ? { ...v, [field]: value } : v
      ),
    }));
  };

  return (
    <>
      <h2 className="section-heading">Venue Scouting</h2>
      <p className="section-desc">Los Angeles area · 80–100 guests · drag to reorder by priority</p>

      <Alert type="warn" icon="⚠">
        <strong>Budget reality:</strong> At a $20–30k total, the venue fee realistically needs to stay around $3–8k. Garden/park venues, outside-catering lofts (marked ✓ BYO), and restaurant buyouts are the realistic paths.
      </Alert>

      {/* General Notes Section */}
      <div className="notes-section">
        <div className="notes-section-title">Venue Scouting Notes</div>
        <textarea
          className="notes-textarea"
          value={data.venueNotes || ''}
          onChange={e => updateGeneralNotes(e.target.value)}
          placeholder="General notes about venue scouting — questions to ask, things to compare, insights from tours..."
        />
      </div>

      <div className="venue-legend">
        <span className="legend-item">
          <span className="catering-badge byo">✓ BYO</span> Outside catering allowed
        </span>
        <span className="legend-item">
          <span className="catering-badge inhouse">⊘ In-house</span> Catering required from venue
        </span>
        <span className="legend-item" style={{ color: 'var(--muted)', fontSize: 11 }}>
          ⠿ drag to reorder
        </span>
      </div>

      <div className="venue-list" ref={listRef}>
        {venues.map((venue, idx) => (
          <div
            key={venue.id}
            className={`venue-row ${venue.deprioritized ? 'deprioritized' : ''} ${draggedId === venue.id ? 'dragging' : ''} ${dragOverId === venue.id ? 'drag-over' : ''}`}
            draggable
            onDragStart={e => handleDragStart(e, venue.id)}
            onDragEnd={handleDragEnd}
            onDragOver={e => handleDragOver(e, venue.id)}
            onDrop={e => handleDrop(e, venue.id)}
          >
            <div className="drag-handle">⠿</div>
            <div className="rank-num">{idx + 1}</div>
            <div className="venue-row-body">
              <div className="venue-row-top">
                <div>
                  <div className="venue-row-name">{venue.name}</div>
                  <div className="venue-row-location">{venue.location}</div>
                </div>
                <div className="venue-row-meta">
                  <span className={`catering-badge ${venue.cateringType}`}>
                    {venue.cateringType === 'byo' ? '✓ BYO' : '⊘ In-house'}
                  </span>
                  <select
                    className={`venue-status status-${venue.status}`}
                    value={venue.status}
                    onChange={e => updateVenueStatus(venue.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
                  >
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  {venue.url && (
                    <a href={venue.url} target="_blank" rel="noreferrer" className="venue-link">
                      ↗ Website
                    </a>
                  )}
                  <button
                    onClick={() => toggleDeprioritized(venue.id)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 10,
                      cursor: 'pointer',
                      color: venue.deprioritized ? 'var(--success)' : 'var(--muted)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {venue.deprioritized ? '↑ Restore' : '↓ Deprioritize'}
                  </button>
                </div>
              </div>

              <div className="venue-row-specs">
                <div className="venue-spec">
                  <div className="spec-label">Capacity</div>
                  <input
                    type="text"
                    className="spec-input"
                    value={venue.capacity}
                    onChange={e => updateVenueField(venue.id, 'capacity', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="e.g. ~100 seated"
                  />
                </div>
                <div className="venue-spec">
                  <div className="spec-label">Est. Rental</div>
                  <input
                    type="text"
                    className="spec-input"
                    value={venue.estRental}
                    onChange={e => updateVenueField(venue.id, 'estRental', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="e.g. $5–7k"
                  />
                </div>
                <div className="venue-spec">
                  <div className="spec-label">Style</div>
                  <input
                    type="text"
                    className="spec-input"
                    value={venue.style}
                    onChange={e => updateVenueField(venue.id, 'style', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="e.g. Industrial loft"
                  />
                </div>
                <div className="venue-spec">
                  <div className="spec-label">Outside F&B</div>
                  <select
                    className="spec-select"
                    value={venue.cateringType}
                    onChange={e => updateVenueField(venue.id, 'cateringType', e.target.value)}
                    onClick={e => e.stopPropagation()}
                  >
                    <option value="byo">Yes (BYO)</option>
                    <option value="inhouse">No (In-house only)</option>
                  </select>
                </div>
                <div className="venue-spec venue-spec-full">
                  <div className="spec-label">Features</div>
                  <AutoResizeTextarea
                    id={`${venue.id}-features`}
                    className="spec-textarea"
                    value={venue.features || ''}
                    onChange={e => updateVenueField(venue.id, 'features', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="e.g. prep kitchen, bridal suite, outdoor space, no curfew..."
                  />
                </div>
              </div>

              <div className="venue-notes">{venue.notes.split('\n').map((line, i) => (
                <span key={i}>{line}{i < venue.notes.split('\n').length - 1 && <br />}</span>
              ))}</div>

              {/* User Notes Section */}
              <div className="venue-user-notes">
                <div className="venue-user-notes-label">Your Notes</div>
                <AutoResizeTextarea
                  id={`${venue.id}-notes`}
                  className="venue-user-notes-input"
                  value={venue.userNotes || ''}
                  onChange={e => updateVenueNotes(venue.id, e.target.value)}
                  placeholder="Add your notes about this venue — impressions from tour, contact info, quotes received..."
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Alert type="info" icon="→" style={{ marginTop: 20 }}>
        <strong>Questions to ask every venue:</strong> What's included in the rental fee? Is catering in-house or outside? Any F&B minimum? Noise curfew? Rain contingency? Cancellation policy? Valet mandatory?
      </Alert>
    </>
  );
}
