const EVENTS = [
  { key: 'engagement', title: 'Engagement Party', when: 'Suggested: May–Jul 2026' },
  { key: 'bachelorette', title: 'Bachelorette Party', when: 'Suggested: Feb–Mar 2027' },
  { key: 'bachelor', title: 'Bachelor Party', when: 'Suggested: Feb–Mar 2027' },
  { key: 'bridalShower', title: 'Bridal Shower', when: 'Suggested: Mar 2027' },
  { key: 'rehearsalDinner', title: 'Rehearsal Dinner', when: 'Night before wedding day' },
  { key: 'intimateCeremony', title: 'Intimate Ceremony', when: 'Separate date TBD' },
];

export default function SatellitesTab({ data, updateData }) {
  const satellites = data?.tasks?.satellites || {};

  const toggleTask = (eventKey, taskId) => {
    updateData(prev => {
      const prevSatellites = prev.tasks?.satellites || {};
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          satellites: {
            ...prevSatellites,
            [eventKey]: (prevSatellites[eventKey] || []).map(t =>
              t.id === taskId ? { ...t, done: !t.done } : t
            ),
          },
        },
      };
    });
  };

  return (
    <>
      <h2 className="section-heading">Satellite Events</h2>
      <p className="section-desc">All the events surrounding the big day</p>

      <div className="event-grid">
        {EVENTS.map(event => (
          <div className="event-card" key={event.key}>
            <div className="event-card-title">{event.title}</div>
            <div className="event-card-when">{event.when}</div>
            <div className="event-tasks">
              {(satellites[event.key] || []).map(task => (
                <div
                  key={task.id}
                  className={`event-task ${task.done ? 'done' : ''}`}
                  onClick={() => toggleTask(event.key, task.id)}
                >
                  <div className="event-task-dot" />
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
