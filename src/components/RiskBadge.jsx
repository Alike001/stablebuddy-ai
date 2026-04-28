// Small status pill for risk levels. Uses the level object returned by the
// risk engine ({ level, label, tone }).

const TONE_CLASS = {
  success: 'risk-badge-success',
  info: 'risk-badge-info',
  warning: 'risk-badge-warning',
  danger: 'risk-badge-danger',
}

export default function RiskBadge({ level, score, compact = false }) {
  if (!level) return null
  const cls = TONE_CLASS[level.tone] || 'risk-badge-info'
  return (
    <span className={`risk-badge ${cls} ${compact ? 'is-compact' : ''}`}>
      <span className="risk-badge-dot" aria-hidden />
      <span className="risk-badge-label">{level.label}</span>
      {typeof score === 'number' && (
        <span className="risk-badge-score">{score}</span>
      )}
    </span>
  )
}
