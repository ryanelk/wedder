import { Task } from './shared.jsx';

const PHASES = [
  { key: 'phase1', date: 'Now–Jun 2026', title: 'Phase 1 — Foundation', dotClass: '' },
  { key: 'phase2', date: 'Jul–Sep 2026', title: 'Phase 2 — Vendors', dotClass: 'future' },
  { key: 'phase3', date: 'Oct–Dec 2026', title: 'Phase 3 — Invitations & Details', dotClass: 'future' },
  { key: 'phase4', date: 'Jan–Mar 2027', title: 'Phase 4 — Final Stretch', dotClass: 'future' },
];

export default function TimelineTab({ data, updateData }) {
  const timeline = data?.tasks?.timeline || {};

  const toggleTask = (phaseKey, taskId) => {
    updateData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        timeline: {
          ...(prev.tasks?.timeline || {}),
          [phaseKey]: (prev.tasks?.timeline?.[phaseKey] || []).map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        },
      },
    }));
  };

  return (
    <>
      <h2 className="section-heading">Planning Timeline</h2>
      <p className="section-desc">18-month roadmap — target wedding date: May 2027</p>

      <div className="timeline">
        {PHASES.map((phase, i) => (
          <div className="timeline-phase" key={phase.key}>
            <div className="phase-marker">
              <div className="phase-date">{phase.date}</div>
              <div className={`phase-dot ${phase.dotClass}`} />
              {i < PHASES.length - 1 && <div className="phase-line" />}
            </div>
            <div className="phase-content">
              <div className="phase-title">{phase.title}</div>
              <div className="task-list">
                {(timeline[phase.key] || []).map(task => (
                  <Task
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(phase.key, task.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="timeline-phase">
          <div className="phase-marker">
            <div className="phase-date">May 2027</div>
            <div className="phase-dot future" />
          </div>
          <div className="phase-content">
            <div className="phase-title">🎉 Wedding Day</div>
          </div>
        </div>
      </div>
    </>
  );
}
