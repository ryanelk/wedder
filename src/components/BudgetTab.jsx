import { VENDORS, TARGET, vstate, withVendor, est, totals, money, k } from '../data/plan.js';

const clean = s => s.replace(/[$,\s]/g, '');

export default function BudgetTab({ api }) {
  const { data, updateData } = api;
  const tt = totals(data);
  const set = (vid, field, value) => updateData(prev => withVendor(prev, vid, { [field]: value }));
  const max = Math.max(20000, tt.projected * 1.08);
  const pct = n => Math.min(100, n / max * 100) + '%';
  const estLo = VENDORS.reduce((a, v) => a + est(data, v)[0], 0);
  const estHi = VENDORS.reduce((a, v) => a + est(data, v)[1], 0);

  return (
    <section className="wp-panel">
      <div>
        <h2>Budget</h2>
        <p className="desc">Target {money(TARGET)} for 75–85 guests. Tick Booked when a vendor is locked in, adjust the estimate as quotes come in, and enter what you've actually paid.</p>
      </div>
      <div className="block">
        <div className="band" aria-hidden="true">
          <div className="track" />
          <div className="zone" style={{ left: 0, width: pct(TARGET) }} />
          <div className="fill" style={{ width: pct(tt.paid) }} />
          <div className="mark" style={{ left: pct(tt.projected) }} />
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--accent)' }} />Paid <b className="num">{money(tt.paid)}</b></span>
          <span><i style={{ background: 'var(--fg)', width: 2 }} />Projected <b className="num">{money(tt.projected)}</b></span>
          <span><i style={{ background: 'color-mix(in srgb, var(--ok) 22%, transparent)', border: '1px dashed var(--ok)' }} />Within {k(TARGET)} target</span>
          <span>Scale $0–{k(max)}</span>
        </div>
      </div>
      <div className="tbl-wrap">
        <table className="budget-simple">
          <thead><tr><th>Line</th><th className="c">Booked</th><th className="r">Estimate</th><th className="r">Paid</th></tr></thead>
          <tbody>
            {VENDORS.map(v => {
              const s = vstate(data, v);
              const booked = s.status === 'booked';
              return (
                <tr key={v.id} className={booked ? 'is-booked' : ''}>
                  <td className="cat">{v.name}{v.optional && <span className="due"> optional</span>}</td>
                  <td className="c">
                    <input type="checkbox" className="bk" checked={booked} aria-label={v.name + ' booked'}
                      onChange={e => set(v.id, 'status', e.target.checked ? 'booked' : 'todo')} />
                  </td>
                  <td className="r"><span className="brange">
                    <input className="in num bin" inputMode="decimal" maxLength={12} aria-label={v.name + ' estimate low'} placeholder={String(v.est[0])} value={s.estLo ?? String(v.est[0])} onChange={e => set(v.id, 'estLo', clean(e.target.value))} />
                    <span>–</span>
                    <input className="in num bin" inputMode="decimal" maxLength={12} aria-label={v.name + ' estimate high'} placeholder={String(v.est[1])} value={s.estHi ?? String(v.est[1])} onChange={e => set(v.id, 'estHi', clean(e.target.value))} />
                  </span></td>
                  <td className="r"><input className="in num bin" inputMode="decimal" maxLength={12} aria-label={v.name + ' paid'} value={s.paid ?? ''} onChange={e => set(v.id, 'paid', clean(e.target.value))} /></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total">
              <td className="cat">Total</td>
              <td className="c num">{tt.booked} of {tt.active}</td>
              <td className="r num">{money(estLo)}–{money(estHi)}</td>
              <td className="r num">{money(tt.paid)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="desc">Projected uses each line's estimate midpoint, or what you've paid if that's more, so set the estimate to the agreed price once you book. Optional lines (church) count once booked or paid. Tips aren't included; set aside roughly 3–5% of the total.</p>
    </section>
  );
}
