import { PHASES, allTasks, tstate, phaseIndex, byDue, isoToday } from '../data/plan.js';
import { TaskItem, useLocalState } from './plan/ui.jsx';

export default function TimelineTab({ api }) {
  const { data } = api;
  const [hide, setHide] = useLocalState('hideDone', false);
  const tasks = allTasks(data);
  const now = isoToday();
  const groups = PHASES.map((p, i) => ({ p, items: tasks.filter(t => phaseIndex(t) === i) }));
  const undated = tasks.filter(t => phaseIndex(t) === -1);
  if (undated.length) groups.push({ p: { title: 'Anytime', when: 'No date' }, items: undated });

  return (
    <section className="wp-panel">
      <div className="row-head">
        <div>
          <h2>Timeline to May 23</h2>
          <p className="desc">Every task from all four sections in date order. Invitations mail 8 weeks out (Mar 28), RSVPs close 4 weeks out (Apr 25), final headcount to the caterer 2 weeks out (May 9). Click a task to open it in To do.</p>
        </div>
        <div className="toolbar"><label className="chk"><input type="checkbox" checked={hide} onChange={e => setHide(e.target.checked)} /> Hide done</label></div>
      </div>
      <div className="block" style={{ gap: 22 }}>
        {groups.map(g => {
          const items = g.items.sort(byDue);
          const doneN = items.filter(t => tstate(data, t.id).done).length;
          const shown = hide ? items.filter(t => !tstate(data, t.id).done) : items;
          const isNow = g.p.start && now >= g.p.start && now <= g.p.end;
          return (
            <div className={`phase${isNow ? ' now' : ''}`} key={g.p.title}>
              <div className="phase-side">
                <span className="when">{g.p.when}</span>
                <h3>{g.p.title}</h3>
                <span className="prog num">{doneN} of {items.length} done</span>
                <div className="bar ok"><i style={{ width: (items.length ? doneN / items.length * 100 : 0) + '%' }} /></div>
              </div>
              <div className="phase-body">
                {shown.length ? shown.map(t => <TaskItem key={t.id} t={t} ctx="list" api={api} />) : <div className="empty">All done here.</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="wedding-day">
        <span className="t">Wedding day</span>
        <span className="eyebrow">Sunday, May 23, 2027 · Access noon to midnight · Setup 12–3 pm · Ceremony 3:30 pm</span>
      </div>
    </section>
  );
}
