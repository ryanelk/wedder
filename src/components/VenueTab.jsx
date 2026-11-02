import { useState } from 'react';
import { VENUE_QS, uid } from '../data/plan.js';
import { SimpleRow, LinkList } from './plan/ui.jsx';

const INCLUDED = [
  ['Spaces', [['Indoor space', '5,000 sq ft'], ['Patio, bistro lighting', '2,000 sq ft'], ['Central HVAC, Wi-Fi', '✓']]],
  ['Staff', [['On-site manager', '1'], ['Security guard', '1'], ['Coordinator', '1'], ['Bartending', 'in-house'], ['Table and chair setup + breakdown', '✓'], ['Post-event cleaning', 'excl. décor, rentals']]],
  ['Seating', [['72" round tables', '17'], ['6 ft folding or 8 ft farm tables', '35'], ['White wood folding chairs', '100'], ['Farm-style cocktail tables', '8'], ['Sweetheart table', '4 ft × 30"'], ['Lounge set', '9 pieces'], ['Wooden bar', '1']]],
  ['Atmosphere', [['Uplights', '8'], ['Pipe and drape', '✓'], ['Patio shade covers', '✓'], ['Champagne toast, all guests', 'champagne incl.']]],
];
const SETTLED = [
  [['Access window', 'Exactly 12 hours'], ['Setup', '12–3 pm'], ['Ceremony', '3:30 pm, unless at a church'], ['Payment', 'Paid in full'], ['Alcohol', 'You supply it and the drink list'], ['Champagne toast', 'Champagne included']],
  [['Chairs', 'No flip needed'], ['Parking', 'Off-site, street only, no valet'], ['Vendor load-in', 'Multiple entries'], ['Patio weather', 'Shade covers for sun or light rain'], ['Heaters', 'Not using'], ['Day-of coordinator', 'Not hiring one']],
];

export default function VenueTab({ api }) {
  const { data, updateData } = api;
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const plans = Object.entries(data.floorPlans || {}).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));

  const addPlan = e => {
    e.preventDefault();
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) { api.toast('Links need to start with https://'); return; }
    const id = uid();
    updateData(prev => ({ ...prev, floorPlans: { ...(prev.floorPlans || {}), [id]: { url: u, label: label.trim(), at: Date.now() } } }));
    setUrl(''); setLabel(''); api.toast('Floor plan linked');
  };
  const removePlan = id => updateData(prev => { const f = { ...prev.floorPlans }; delete f[id]; return { ...prev, floorPlans: f }; });

  return (
    <section className="wp-panel">
      <div className="venue-hero">
        <div>
          <span className="eyebrow">Booked</span>
          <h2 style={{ marginTop: 4 }}>Seventh/Place</h2>
          <p className="desc">Brick and bow-truss warehouse in the Arts District with a vine-covered patio. Outside catering allowed. <a href="https://seventhplacela.com/" target="_blank" rel="noopener noreferrer">seventhplacela.com</a></p>
        </div>
        <div className="facts">
          <div className="fact"><div className="k">Date</div><div className="val">Sun, May 23, 2027</div></div>
          <div className="fact"><div className="k">Rental</div><div className="val num">$6,950 · paid in full</div></div>
          <div className="fact"><div className="k">Access</div><div className="val">12 hours from noon · setup 12–3, ceremony 3:30</div></div>
          <div className="fact"><div className="k">Space</div><div className="val">5,000 sq ft in + 2,000 sq ft patio</div></div>
        </div>
      </div>

      <div className="block">
        <h3>What's included</h3>
        <div className="incl">
          {INCLUDED.map(([title, rows]) => (
            <div key={title}><span className="eyebrow">{title}</span>
              <ul>{rows.map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}</ul>
            </div>
          ))}
        </div>
        <p className="desc">Seating math: 17 rounds at 8–10 per table seat 136–170, and 100 chairs cover 75–85 guests without moving them. Linens, plates, flatware and glassware aren't included; the party supply vendor can cover those and any chair swap.</p>
      </div>

      <div className="block">
        <div><h3>Floor plan</h3><p className="desc">Link the floor plan you build in an online tool so you can both open it from here. Add a new link for each version if you want to keep old layouts.</p></div>
        <form className="form" onSubmit={addPlan}>
          <input className="in grow" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://… share link to the floor plan" required aria-label="Floor plan link" />
          <input className="in grow" value={label} onChange={e => setLabel(e.target.value)} placeholder="Label, e.g. Rounds layout v2" maxLength={120} aria-label="Floor plan label" />
          <button className="btn" type="submit">Add link</button>
        </form>
        <LinkList items={plans} onRemove={removePlan} empty="No floor plan linked yet. Draw it in any online floor plan tool, copy its share link, and paste it above." />
      </div>

      <div className="block">
        <div><h3>Still to ask Seventh/Place</h3><p className="desc">Tick each one off once you have the answer in writing.</p></div>
        <div className="tasks">{VENUE_QS.map(([id, text]) => <SimpleRow key={id} id={id} text={text} api={api} />)}</div>
      </div>

      <div className="block">
        <h3>Settled</h3>
        <div className="incl answered">
          {SETTLED.map((rows, i) => <div key={i}><ul>{rows.map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}</ul></div>)}
        </div>
      </div>
    </section>
  );
}
