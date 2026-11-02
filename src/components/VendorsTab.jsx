import { VENDORS, STATUSES, vstate, withVendor, isActive, estText, money, fmtD, daysUntil } from '../data/plan.js';
import { Shortlist } from './plan/ui.jsx';

export default function VendorsTab({ api }) {
  const { data, updateData } = api;
  const counts = {};
  VENDORS.forEach(v => { const s = vstate(data, v).status; counts[s] = (counts[s] || 0) + 1; });
  const set = (vid, field, value) => updateData(prev => withVendor(prev, vid, { [field]: value }));

  return (
    <section className="wp-panel">
      <div>
        <h2>Vendors</h2>
        <p className="desc">Keep a shortlist of candidates for each, then set status, what you've paid and a contact once you book. Paid amounts feed the budget.</p>
      </div>
      <div className="pipeline">
        {STATUSES.map(([id, name]) => <div key={id}><div className="eyebrow">{name}</div><div className="v num">{counts[id] || 0}</div></div>)}
      </div>
      <div className="vendors">
        {VENDORS.slice().sort((a, b) => a.by.localeCompare(b.by)).map(v => {
          const s = vstate(data, v);
          const open = isActive(data, v) && s.status !== 'booked';
          const late = open && daysUntil(v.by) < 0;
          return (
            <div className={`vendor${late ? ' late' : ''}`} id={'v-' + v.id} data-status={s.status} key={v.id}>
              <div>
                <div className="name">{v.name}</div>
                <div className="vmeta">
                  <span className="tag" data-t={v.tag}>{v.tag}</span>
                  <span className="num">{s.status === 'booked' ? 'booked' : (late ? 'overdue · ' : 'book by ') + fmtD(v.by)}</span>
                  <span className="num">est {estText(data, v, money)}</span>
                  {v.optional && <span>optional</span>}
                </div>
                <div className="guide">{v.guide}</div>
              </div>
              <div className="fields">
                <label>Status
                  <select className="in" value={s.status} onChange={e => set(v.id, 'status', e.target.value)}>
                    {STATUSES.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </label>
                <label>Paid ($)
                  <input className="in num" inputMode="decimal" placeholder="0" value={s.paid ?? ''} onChange={e => set(v.id, 'paid', e.target.value.replace(/[$,\s]/g, ''))} />
                </label>
                <label className="full">Contact
                  <input className="in" placeholder="name, email, phone" maxLength={200} value={s.contact || ''} onChange={e => set(v.id, 'contact', e.target.value)} />
                </label>
                {!v.noCoi && (
                  <label className="full ins"><span>
                    <input type="checkbox" checked={!!s.insured} onChange={e => set(v.id, 'insured', e.target.checked)} /> Certificate of insurance on file
                  </span></label>
                )}
                <label className="full">Notes
                  <textarea className="in" rows={1} maxLength={2000} placeholder="what's included, deposit, dates…" value={s.notes || ''} onChange={e => set(v.id, 'notes', e.target.value)} />
                </label>
              </div>
              {!v.noShort && <div className="vshort"><Shortlist vid={v.id} api={api} /></div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
