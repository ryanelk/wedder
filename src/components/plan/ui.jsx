import { useState } from 'react';
import {
  TRACKS, OV_KEYS, tstate, withTask, stepCount, findBase, vendorById, trackName,
  fmtD, daysUntil, isoToday, uid,
} from '../../data/plan.js';

export function useLocalState(key, initial) {
  const [val, setVal] = useState(() => {
    try { const raw = localStorage.getItem('wp-ui:' + key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  const set = (next) => {
    setVal(prev => {
      const v = typeof next === 'function' ? next(prev) : next;
      try { localStorage.setItem('wp-ui:' + key, JSON.stringify(v)); } catch { /* ignore */ }
      return v;
    });
  };
  return [val, set];
}

export function TrackTag({ track }) {
  return <span className={`tag tr-${track}`}>{trackName(track)}</span>;
}

export function DueChip({ t, st }) {
  if (st.done) return <span className="due num ok">done{st.doneAt ? ' ' + fmtD(st.doneAt) : ''}</span>;
  if (!t.due) return <span className="due">no date</span>;
  const d = daysUntil(t.due);
  const cls = d < 0 ? 'late' : d <= 14 ? 'soon' : '';
  return <span className={`due num ${cls}`}>{d < 0 ? 'overdue · ' : d === 0 ? 'today · ' : ''}{fmtD(t.due)}</span>;
}

// A task row. In the To do tab ("todo" context) it expands into steps, shortlist, notes and an editor.
// Elsewhere ("list" context) clicking the title opens it in To do.
export function TaskItem({ t, ctx, api }) {
  const { data, updateData } = api;
  const st = tstate(data, t.id);
  const open = ctx === 'todo' && api.expanded.includes(t.id);
  const [draft, setDraft] = useState(null);
  const sc = stepCount(t, st);

  const startEdit = () => {
    setDraft({
      text: t.text, due: t.due || '', track: t.track, why: t.why || '', armed: false,
      steps: t.steps.map(s => ({ key: 's:' + s[0], text: s[1] })).concat(st.extra.map(x => ({ key: 'x:' + x.id, text: x.text }))),
    });
    if (!open) api.toggleExpand(t.id);
  };
  const toggleDone = () => updateData(prev => withTask(prev, t.id, s => { s.done = !s.done; s.doneAt = s.done ? isoToday() : ''; }));
  const onTitle = () => (ctx === 'todo' ? api.toggleExpand(t.id) : api.openInTodo(t.id));

  return (
    <div className={`todo${st.done ? ' done' : ''}${open ? ' open' : ''}`} id={(ctx === 'todo' ? 'td-' : 'tl-') + t.id}>
      <div className="todo-row">
        <button className="box" role="checkbox" aria-checked={st.done} aria-label={'Done: ' + t.text} onClick={toggleDone}>✓</button>
        <button className="todo-title" aria-expanded={open} onClick={onTitle}>
          {t.text}<span className="chev" aria-hidden="true">{ctx === 'todo' ? (open ? '▴' : '▾') : '→'}</span>
        </button>
        <span className="meta">
          {ctx !== 'todo' ? <TrackTag track={t.track} /> : <button className="edit-btn" onClick={startEdit}>edit</button>}
          {sc.total > 0 && <span className="due num">{sc.done}/{sc.total} steps</span>}
          {st.notes && <span className="due">notes</span>}
          <DueChip t={t} st={st} />
        </span>
      </div>
      {open && (
        <div className="todo-detail">
          {draft
            ? <EditForm t={t} draft={draft} setDraft={setDraft} api={api} />
            : <Detail t={t} st={st} api={api} onEdit={startEdit} />}
        </div>
      )}
    </div>
  );
}

function Step({ on, text, onToggle, onRemove }) {
  return (
    <div className="step-wrap">
      <button className={`step${on ? ' on' : ''}`} role="checkbox" aria-checked={on} onClick={onToggle}>
        <span className="box">✓</span><span>{text}</span>
      </button>
      {onRemove && <button className="del" onClick={onRemove} aria-label="Remove step">×</button>}
    </div>
  );
}

function Detail({ t, st, api, onEdit }) {
  const { updateData } = api;
  const [newStep, setNewStep] = useState('');
  const v = t.ref?.vendor ? vendorById(t.ref.vendor) : null;

  const toggleStep = (kind, sid) => updateData(prev => withTask(prev, t.id, s => {
    if (kind === 's') s.steps[sid] = !s.steps[sid];
    else { const x = s.extra.find(e => e.id === sid); if (x) x.done = !x.done; }
  }));
  const removeExtra = sid => updateData(prev => withTask(prev, t.id, s => { s.extra = s.extra.filter(x => x.id !== sid); }));
  const addStep = e => {
    e.preventDefault();
    const txt = newStep.trim(); if (!txt) return;
    updateData(prev => withTask(prev, t.id, s => { s.extra.push({ id: uid(), text: txt, done: false }); }));
    setNewStep('');
  };
  const setNotes = val => updateData(prev => withTask(prev, t.id, s => { s.notes = val; }));

  return (
    <>
      <div className="det-top">
        {t.why ? <p className="why">{t.why}</p> : <span />}
        <button className="chip-link" onClick={onEdit}>Edit task</button>
      </div>
      <div className="block" style={{ gap: 6 }}>
        <span className="eyebrow">Steps</span>
        <div className="steps">
          {t.steps.length + st.extra.length === 0 && <span className="sl-empty">No steps yet. Add the ones you need.</span>}
          {t.steps.map(([sid, text]) => <Step key={sid} on={!!st.steps[sid]} text={text} onToggle={() => toggleStep('s', sid)} />)}
          {st.extra.map(x => <Step key={x.id} on={!!x.done} text={x.text} onToggle={() => toggleStep('x', x.id)} onRemove={() => removeExtra(x.id)} />)}
        </div>
        <form className="step-add" onSubmit={addStep}>
          <input className="in" value={newStep} onChange={e => setNewStep(e.target.value)} placeholder="Add a step" maxLength={160} aria-label="New step" />
          <button className="btn ghost" type="submit">Add step</button>
        </form>
      </div>
      {v && !v.noShort && <Shortlist vid={v.id} api={api} />}
      <label className="notes-l">
        <span className="eyebrow">Notes and decisions</span>
        <textarea className="in notes-area" rows={3} maxLength={4000} value={st.notes} onChange={e => setNotes(e.target.value)} placeholder="What you decided, links, quotes, who is handling it" />
      </label>
      {(v || t.ref?.tab) && (
        <div className="refs">
          {v && <button className="chip-link" onClick={() => api.goVendor(v.id)}>Vendor card: {v.name} →</button>}
          {t.ref?.tab && <button className="chip-link" onClick={() => api.goTab(t.ref.tab)}>{t.ref.label || t.ref.tab} →</button>}
        </div>
      )}
    </>
  );
}

function EditForm({ t, draft, setDraft, api }) {
  const { data, updateData } = api;
  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const setStep = (i, val) => setDraft(d => ({ ...d, steps: d.steps.map((s, j) => (j === i ? { ...s, text: val } : s)) }));
  const removeStep = i => setDraft(d => ({ ...d, steps: d.steps.filter((_, j) => j !== i) }));
  const addStep = () => setDraft(d => ({ ...d, steps: [...d.steps, { key: 'n:' + uid(), text: '' }] }));

  const save = () => {
    const b = findBase(data, t.id); if (!b) return;
    updateData(prev => withTask(prev, t.id, st => {
      const text = draft.text.trim() || b.text;
      if (text === b.text) delete st.text; else st.text = text;
      if (draft.due === (b.due || '')) delete st.due; else st.due = draft.due;
      if (draft.track === b.track) delete st.track; else st.track = draft.track;
      const why = draft.why.trim();
      if (why === (b.why || '')) delete st.why; else st.why = why;
      const stepEdits = {}, stepHidden = {};
      b.steps.forEach(([sid, txt]) => {
        const it = draft.steps.find(s => s.key === 's:' + sid);
        if (!it || !it.text.trim()) { stepHidden[sid] = true; delete st.steps[sid]; }
        else if (it.text.trim() !== txt) stepEdits[sid] = it.text.trim();
      });
      if (Object.keys(stepEdits).length) st.stepEdits = stepEdits; else delete st.stepEdits;
      if (Object.keys(stepHidden).length) st.stepHidden = stepHidden; else delete st.stepHidden;
      const old = {}; st.extra.forEach(x => { old[x.id] = x; });
      st.extra = draft.steps.filter(s => !s.key.startsWith('s:') && s.text.trim()).map(s =>
        s.key.startsWith('x:') && old[s.key.slice(2)] ? { ...old[s.key.slice(2)], text: s.text.trim() } : { id: uid(), text: s.text.trim(), done: false });
    }));
    setDraft(null);
    api.toast(draft.track !== t.track ? 'Saved and moved to ' + trackName(draft.track) : 'Saved');
  };
  const reset = () => {
    updateData(prev => withTask(prev, t.id, st => { OV_KEYS.forEach(key => delete st[key]); }));
    setDraft(null); api.toast('Restored the original');
  };
  const del = () => {
    if (!draft.armed) { set('armed', true); return; }
    updateData(prev => withTask(prev, t.id, st => { st.hidden = true; }));
    setDraft(null); api.collapse(t.id);
    api.toast('Deleted. Restore it from "Deleted tasks" at the bottom.');
  };
  const onKey = e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); save(); }
    if (e.key === 'Escape') setDraft(null);
  };

  return (
    <div className="edit" onKeyDown={onKey}>
      <label className="fld"><span className="eyebrow">Task</span>
        <input className="in" value={draft.text} onChange={e => set('text', e.target.value)} maxLength={160} autoFocus />
      </label>
      <div className="fld-row">
        <label className="fld"><span className="eyebrow">Due date</span>
          <input className="in" type="date" value={draft.due} onChange={e => set('due', e.target.value)} />
        </label>
        <label className="fld"><span className="eyebrow">Section</span>
          <select className="in" value={draft.track} onChange={e => set('track', e.target.value)}>
            {TRACKS.map(tr => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
          </select>
        </label>
      </div>
      <label className="fld"><span className="eyebrow">Description</span>
        <textarea className="in" rows={2} maxLength={600} value={draft.why} onChange={e => set('why', e.target.value)} placeholder="Why it matters, what it depends on" />
      </label>
      <div className="fld"><span className="eyebrow">Steps</span>
        <div className="ed-steps">
          {draft.steps.map((s, i) => (
            <div className="ed-step" key={s.key}>
              <input className="in" value={s.text} onChange={e => setStep(i, e.target.value)} maxLength={160} aria-label={'Step ' + (i + 1)} />
              <button type="button" className="del" onClick={() => removeStep(i)} aria-label="Remove step">×</button>
            </div>
          ))}
          <button type="button" className="chip-link" style={{ alignSelf: 'flex-start' }} onClick={addStep}>+ Add step</button>
        </div>
      </div>
      <div className="ed-actions">
        <button type="button" className="btn" onClick={save}>Save</button>
        <button type="button" className="btn ghost" onClick={() => setDraft(null)}>Cancel</button>
        {t.edited && !t.custom && <button type="button" className="btn ghost" onClick={reset}>Restore original</button>}
        <button type="button" className={`btn ghost danger${draft.armed ? ' armed' : ''}`} onClick={del}>{draft.armed ? 'Click again to delete' : 'Delete task'}</button>
      </div>
    </div>
  );
}

export function Shortlist({ vid, api }) {
  const { data, updateData } = api;
  const [f, setF] = useState({ name: '', price: '', link: '' });
  const items = Object.entries(data.shortlist || {}).filter(([, s]) => s.vendor === vid).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));

  const add = e => {
    e.preventDefault();
    const name = f.name.trim(), link = f.link.trim(), price = f.price.trim();
    if (!name && !link) { api.toast('Add a name or a link'); return; }
    const id = uid();
    updateData(prev => ({ ...prev, shortlist: { ...(prev.shortlist || {}), [id]: { vendor: vid, name, link, price, pick: false, at: Date.now() } } }));
    setF({ name: '', price: '', link: '' });
  };
  const pick = id => updateData(prev => ({ ...prev, shortlist: { ...prev.shortlist, [id]: { ...prev.shortlist[id], pick: !prev.shortlist[id].pick } } }));
  const remove = id => updateData(prev => { const s = { ...prev.shortlist }; delete s[id]; return { ...prev, shortlist: s }; });

  return (
    <div className="sl">
      <span className="eyebrow">Shortlist · ★ marks the pick</span>
      <div className="sl-list">
        {!items.length && <span className="sl-empty">No candidates yet.</span>}
        {items.map(([id, s]) => {
          const isUrl = /^https?:\/\//i.test(s.link || '');
          const label = <>{s.name || s.link}{s.link && !isUrl && <span className="due"> {s.link}</span>}</>;
          return (
            <div className={`sl-item${s.pick ? ' pick' : ''}`} key={id}>
              <button className="star" aria-pressed={!!s.pick} title="Mark as the pick" onClick={() => pick(id)}>★</button>
              <span className="sl-name">{isUrl ? <a href={s.link} target="_blank" rel="noopener noreferrer">{label}</a> : label}</span>
              {s.price && <span className="num">{s.price}</span>}
              <button className="del" aria-label="Remove candidate" onClick={() => remove(id)}>×</button>
            </div>
          );
        })}
      </div>
      <form className="sl-form" onSubmit={add}>
        <input className="in" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Name" maxLength={100} aria-label="Candidate name" />
        <input className="in num" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} placeholder="Price" maxLength={30} aria-label="Price" />
        <input className="in" value={f.link} onChange={e => setF({ ...f, link: e.target.value })} placeholder="Website or contact" maxLength={300} aria-label="Website or contact" />
        <button className="btn ghost" type="submit">Add</button>
      </form>
    </div>
  );
}

export function SimpleRow({ id, text, api }) {
  const done = tstate(api.data, id).done;
  const toggle = () => api.updateData(prev => withTask(prev, id, s => { s.done = !s.done; s.doneAt = s.done ? isoToday() : ''; }));
  return (
    <div className={`task${done ? ' done' : ''}`} role="checkbox" tabIndex={0} aria-checked={done}
      onClick={toggle} onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } }}>
      <span className="box">✓</span><span className="txt">{text}</span>
    </div>
  );
}

export function LinkList({ items, onRemove, empty }) {
  if (!items.length) return <div className="empty">{empty}</div>;
  return (
    <div className="links">
      {items.map(([id, l]) => {
        let host = ''; try { host = new URL(l.url).hostname.replace(/^www\./, ''); } catch { /* ignore */ }
        const safe = /^https?:\/\//i.test(l.url) ? l.url : '#';
        return (
          <div className="link" key={id}>
            <div><div className="l">{l.label || host || l.url}</div><div className="u">{l.url}</div></div>
            <a href={safe} target="_blank" rel="noopener noreferrer">Open ↗</a>
            <button className="del" aria-label="Remove link" onClick={() => onRemove(id)}>×</button>
          </div>
        );
      })}
    </div>
  );
}
