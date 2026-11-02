import { useState } from 'react';
import {
  TRACKS, MON, allTasks, deletedTasks, tstate, trackStats, byDue, isoToday, fmtD, trackName, uid, withTask,
} from '../data/plan.js';
import { TaskItem, TrackTag, useLocalState } from './plan/ui.jsx';

export default function TodoTab({ api }) {
  const { data, updateData, track } = api;
  const [hide, setHide] = useLocalState('hideDoneTodo', false);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const tr = TRACKS.find(t => t.id === track) || TRACKS[0];
  const stats = trackStats(data, tr.id);

  const list = allTasks(data).filter(t => t.track === tr.id).sort(byDue);
  const groups = [];
  list.forEach(t => {
    const key = t.due ? t.due.slice(0, 7) : 'none';
    let g = groups.find(x => x.key === key);
    if (!g) { g = { key, items: [] }; groups.push(g); }
    g.items.push(t);
  });
  const nowKey = isoToday().slice(0, 7);
  const deleted = deletedTasks(data);

  const addTask = e => {
    e.preventDefault();
    const t = text.trim(); if (!t) return;
    const cid = uid();
    updateData(prev => ({ ...prev, customTasks: { ...(prev.customTasks || {}), [cid]: { text: t, track: tr.id, due, at: Date.now() } } }));
    setText(''); setDue('');
    api.toast('Added to ' + tr.name);
  };
  const restore = id => { updateData(prev => withTask(prev, id, st => { delete st.hidden; })); api.toast('Restored'); };
  const purge = cid => {
    updateData(prev => {
      const customTasks = { ...prev.customTasks }; delete customTasks[cid];
      const taskState = { ...prev.taskState }; delete taskState['c-' + cid];
      return { ...prev, customTasks, taskState };
    });
    api.toast('Deleted for good');
  };

  return (
    <section className="wp-panel">
      <div className="row-head">
        <div>
          <h2>To do</h2>
          <p className="desc">The plan, split into four sections. Open a task to tick off its steps, keep a shortlist, and write down what you decided. Use edit on any task to change its name, date, section or steps.</p>
        </div>
        <div className="toolbar"><label className="chk"><input type="checkbox" checked={hide} onChange={e => setHide(e.target.checked)} /> Hide done</label></div>
      </div>

      <div className="bubbles" role="tablist" aria-label="To do sections">
        {TRACKS.map(t => {
          const s = trackStats(data, t.id);
          return (
            <button key={t.id} className={`bubble tr-${t.id}`} role="tab" aria-selected={t.id === tr.id} onClick={() => api.goTrack(t.id)}>
              {t.name}<span className="n num">{s.done}/{s.total}</span>
            </button>
          );
        })}
      </div>

      <div className={`sec-head tr-${tr.id}`}>
        <div><h3>{tr.name}</h3><p className="desc">{tr.desc}</p></div>
        <div className="sec-prog">
          <span className="num">{stats.done} of {stats.total} done</span>
          <div className="bar ok"><i style={{ width: (stats.total ? stats.done / stats.total * 100 : 0) + '%' }} /></div>
          <span>{stats.next ? <>Next: {stats.next.text}{stats.next.due ? ' · ' + fmtD(stats.next.due) : ''}</> : 'All done.'}</span>
        </div>
      </div>

      <div className="block" style={{ gap: 18 }}>
        {groups.map(g => {
          const shown = hide ? g.items.filter(t => !tstate(data, t.id).done) : g.items;
          if (hide && !shown.length) return null;
          const doneN = g.items.filter(t => tstate(data, t.id).done).length;
          const label = g.key === 'none' ? 'No date' : MON[+g.key.slice(5) - 1] + ' ' + g.key.slice(0, 4);
          return (
            <div className={`mgroup${g.key === nowKey ? ' now' : ''}`} key={g.key}>
              <div className="mlabel"><span className="when">{label}</span><span className="prog num">{doneN}/{g.items.length} done</span></div>
              <div className="mbody">{shown.map(t => <TaskItem key={t.id} t={t} ctx="todo" api={api} />)}</div>
            </div>
          );
        })}
        {!groups.length && <div className="empty">Nothing in {tr.name} yet.</div>}
      </div>

      {deleted.length > 0 && (
        <details className="deleted">
          <summary>Deleted tasks ({deleted.length})</summary>
          {deleted.map(t => (
            <div className="row" key={t.id}>
              <span>{t.text}</span>
              <TrackTag track={t.track} />
              <button className="chip-link" onClick={() => restore(t.id)}>Restore</button>
              {t.custom && <button className="del-text" onClick={() => purge(t.cid)}>Delete forever</button>}
            </div>
          ))}
        </details>
      )}

      <form className="form" onSubmit={addTask}>
        <input className="in grow" value={text} onChange={e => setText(e.target.value)} placeholder="Add a task to this section" required maxLength={160} aria-label="Task" />
        <input className="in" type="date" value={due} onChange={e => setDue(e.target.value)} aria-label="Due date" />
        <button className="btn" type="submit">Add to {trackName(tr.id)}</button>
      </form>
    </section>
  );
}
