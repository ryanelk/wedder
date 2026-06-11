export function Task({ task, onToggle }) {
  const tagClass = `task-tag tag-${task.tag || 'logistics'}`;

  return (
    <div className={`task ${task.done ? 'done' : ''}`} onClick={onToggle}>
      <div className="task-check">✓</div>
      <div className="task-text">{task.text}</div>
      {task.tag && <span className={tagClass}>{task.tag}</span>}
    </div>
  );
}

export function Alert({ type, icon, children }) {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-icon">{icon}</div>
      <div>{children}</div>
    </div>
  );
}

export function Modal({ title, onClose, onConfirm, confirmText = 'Add', children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-fields">{children}</div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export function ModalField({ label, children }) {
  return (
    <div>
      <div className="modal-field-label">{label}</div>
      {children}
    </div>
  );
}
