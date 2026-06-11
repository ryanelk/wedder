import { useState, useRef } from 'react';
import { Alert } from './shared.jsx';

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
                  <div className="spec-val">{venue.capacity}</div>
                </div>
                <div className="venue-spec">
                  <div className="spec-label">Est. Rental</div>
                  <div className="spec-val">{venue.estRental}</div>
                </div>
                <div className="venue-spec">
                  <div className="spec-label">Style</div>
                  <div className="spec-val">{venue.style}</div>
                </div>
                <div className="venue-spec">
                  <div className="spec-label">Catering</div>
                  <div className="spec-val">{venue.catering}</div>
                </div>
              </div>

              <div className="venue-notes">{venue.notes}</div>

              {/* User Notes Section */}
              <div className="venue-user-notes">
                <div className="venue-user-notes-label">Your Notes</div>
                <textarea
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
