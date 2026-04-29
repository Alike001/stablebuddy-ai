import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page not-found">
      <div className="card not-found-card">
        <div className="not-found-icon" aria-hidden>🧭</div>
        <h1 className="page-title">Page not found</h1>
        <p className="muted">
          That route doesn't exist. The link may be broken — or you may have
          arrived from a stale invoice URL.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <Link to="/dashboard" className="btn btn-ghost">Open dashboard</Link>
        </div>
      </div>
    </div>
  )
}
