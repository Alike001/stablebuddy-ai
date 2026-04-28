// Friendly empty-state block for any list that has no data yet.

export default function EmptyState({ icon = '✨', title, body, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden>{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {body && <p className="empty-state-body">{body}</p>}
      {action}
    </div>
  )
}
