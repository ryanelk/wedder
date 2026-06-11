import { Task, Alert } from './shared.jsx';

export default function OverviewTab({ data, updateData }) {
  const toggleTask = (taskId) => {
    updateData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        overview: prev.tasks.overview.map(t =>
          t.id === taskId ? { ...t, done: !t.done } : t
        ),
      },
    }));
  };

  // Calculate budget totals (simplified)
  const totalCommitted = data.budget
    .filter(b => b.actual && b.actual !== '—' && b.actual !== 'TBD')
    .reduce((sum, b) => {
      const num = parseFloat(b.actual.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  return (
    <>
      <div className="budget-bar">
        <div className="budget-stat">
          <div className="val">$20–30K</div>
          <div className="lbl">Target Budget</div>
        </div>
        <div className="budget-stat">
          <div className="val spent">${totalCommitted.toLocaleString()}</div>
          <div className="lbl">Committed</div>
        </div>
        <div className="budget-stat">
          <div className="val remaining">$20–30K</div>
          <div className="lbl">Remaining</div>
        </div>
        <div className="budget-track">
          <div className="budget-track-label">Budget used — {Math.round((totalCommitted / 25000) * 100)}%</div>
          <div className="budget-track-bar">
            <div className="budget-track-fill" style={{ width: `${Math.min(100, (totalCommitted / 25000) * 100)}%` }} />
          </div>
        </div>
      </div>

      <Alert type="warn" icon="⚠">
        <strong>Heads-up:</strong> $20–30k for 80–100 guests in LA is lean but workable — if you lean on a low-fee, outside-catering, or restaurant venue and keep the guest list tight.
      </Alert>

      <Alert type="info" icon="→">
        <strong>Next action:</strong> Venue scouting is the critical first step — everything else cascades from venue. Start contacting venues now — LA popular venues book 12–18 months out.
      </Alert>

      <h2 className="section-heading">Immediate Priorities</h2>
      <p className="section-desc">Things to tackle in the next 4–6 weeks</p>

      <div className="task-list">
        {data.tasks.overview.map(task => (
          <Task key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
        ))}
      </div>
    </>
  );
}
