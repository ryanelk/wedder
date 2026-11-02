import {
  TRACKS, TARGET, VENDORS, allTasks, tstate, totals, trackStats, vstate, byDue, isActive,
  estText, money, k, fmtD, daysUntil, statusName, VENUE_QS,
} from '../data/plan.js';
import { TaskItem, DueChip } from './plan/ui.jsx';

export default function OverviewTab({ api }) {
  const { data } = api;
  const ids = allTasks(data).map(t => t.id).concat(VENUE_QS.map(q => q[0]));
  const done = ids.filter(id => tstate(data, id).done).length;
  const tt = totals(data);
  const gap = tt.projected - TARGET;
  const needCoi = VENDORS.filter(v => !v.noCoi && vstate(data, v).status === 'booked');
  const insured = needCoi.filter(v => vstate(data, v).insured).length;
  const next = allTasks(data).filter(t => !tstate(data, t.id).done && t.due).sort(byDue).slice(0, 6);
  const bookNext = VENDORS.filter(v => isActive(data, v) && vstate(data, v).status !== 'booked').sort((a, b) => a.by.localeCompare(b.by)).slice(0, 5);

  return (
    <section className="wp-panel">
      <div className="stats">
        <div className="stat">
          <span className="eyebrow">Tasks done</span>
          <span className="v num">{done} / {ids.length}</span>
          <div className="bar ok"><i style={{ width: (ids.length ? done / ids.length * 100 : 0) + '%' }} /></div>
        </div>
        <div className="stat">
          <span className="eyebrow">Vendors booked</span>
          <span className="v num">{tt.booked} / {tt.active}</span>
          <div className="bar ok"><i style={{ width: (tt.active ? tt.booked / tt.active * 100 : 0) + '%' }} /></div>
          <span className="s">{needCoi.length ? `${insured} of ${needCoi.length} booked vendors insured` : 'Insurance certificates tracked per vendor'}</span>
        </div>
        <div className="stat">
          <span className="eyebrow">Paid</span>
          <span className="v num">{money(tt.paid)}</span>
          <span className="s">of {k(TARGET)} target · {Math.round(tt.paid / TARGET * 100)}% used</span>
        </div>
        <div className="stat">
          <span className="eyebrow">Projected total</span>
          <span className="v num" style={{ color: gap > 0 ? 'var(--bad)' : 'var(--ok)' }}>{money(tt.projected)}</span>
          <span className="s">{gap > 0 ? `${money(gap)} over target` : `${money(-gap)} under target`}</span>
        </div>
      </div>

      <div className="block">
        <div className="row-head"><div><h2>By section</h2><p className="desc">Jump into a section of the To do list.</p></div></div>
        <div className="tiles">
          {TRACKS.map(tr => {
            const s = trackStats(data, tr.id);
            return (
              <button className={`tile tr-${tr.id}`} key={tr.id} onClick={() => api.goTrack(tr.id)}>
                <span className="nm">{tr.name}</span>
                <span className="ct num">{s.done} of {s.total} done</span>
                <div className="bar ok"><i style={{ width: (s.total ? s.done / s.total * 100 : 0) + '%' }} /></div>
                <span className="nx">{s.next ? <>Next: {s.next.text} <DueChip t={s.next} st={tstate(data, s.next.id)} /></> : 'All done'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="block">
        <div className="row-head">
          <div><h2>Next up</h2><p className="desc">Open tasks across every section, by due date. Click one to open its steps.</p></div>
          <button className="btn ghost" onClick={() => api.goTab('timeline')}>Full timeline</button>
        </div>
        <div className="tasks">
          {next.length ? next.map(t => <TaskItem key={t.id} t={t} ctx="list" api={api} />) : <div className="empty">Nothing open with a due date.</div>}
        </div>
      </div>

      <div className="block">
        <div className="row-head">
          <div><h2>Book next</h2><p className="desc">Vendors still open, in the order they need to be locked.</p></div>
          <button className="btn ghost" onClick={() => api.goTab('vendors')}>All vendors</button>
        </div>
        <div className="tasks">
          {bookNext.length ? bookNext.map(v => {
            const s = vstate(data, v), d = daysUntil(v.by), cls = d < 0 ? 'late' : d <= 21 ? 'soon' : '';
            const n = Object.values(data.shortlist || {}).filter(x => x.vendor === v.id).length;
            return (
              <button className="task" key={v.id} onClick={() => api.goVendor(v.id)}>
                <span className="txt">{v.name}</span>
                <span className="meta">
                  <span className="tag" data-t={v.tag}>{statusName(s.status)}</span>
                  {n > 0 && <span className="due num">{n} shortlisted</span>}
                  <span className={`due num ${cls}`}>book by {fmtD(v.by)}</span>
                  <span className="due num">{estText(data, v, k)}</span>
                </span>
              </button>
            );
          }) : <div className="empty">Every vendor is booked.</div>}
        </div>
      </div>

      <div className="block">
        <h2>Watch-outs</h2>
        <div className="notes">
          <div className="note"><strong>Short runway</strong>Save-the-dates, caterer and photographer all belong in November. Good photographers book Sundays later than Saturdays, but not by much.</div>
          <div className="note"><strong>Church ceremony changes the day</strong>An off-site ceremony means guests travel and hunt for street parking twice, and a 3:30 start at a church pushes the reception later. Many churches also have their own rules: premarital counseling, a required officiant, no outside photographers in the sanctuary.</div>
          <div className="note"><strong>Insurance on two fronts</strong>You need event insurance for Seventh/Place, and every vendor working the venue should hand you a certificate of insurance. Ask for it when you book, not the week before.</div>
          <div className="note"><strong>No coordinator means someone owns the clock</strong>With setup at noon and the ceremony at 3:30, pick one trusted person to cue vendors and the processional so neither of you is doing it.</div>
          <div className="note"><strong>Street parking only</strong>Arts District street parking is tight on weekend evenings. Put rideshare and parking guidance on the website, and consider a rideshare code for older guests.</div>
          <div className="note"><strong>Sunday guests</strong>Most guests work Monday (Memorial Day is the following weekend). A clear last call helps, and may also shorten paid vendor hours.</div>
          <div className="note info"><strong>Attire lead time</strong>Made-to-order dresses often take 4–6 months plus alterations. Order by early December, or plan on off-the-rack.</div>
        </div>
      </div>
    </section>
  );
}
