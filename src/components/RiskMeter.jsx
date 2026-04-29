import { levelFromScore } from '../utils/riskEngine.js'

const TONE_COLOR = {
  success: 'var(--success)',
  info: 'var(--info)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
}

function barColor(score) {
  const level = levelFromScore(score)
  return TONE_COLOR[level.tone] || 'var(--brand-500)'
}

export default function RiskMeter({ axes }) {
  if (!axes || axes.length === 0) return null
  return (
    <ul className="risk-meter">
      {axes.map((axis) => {
        const pct = Math.max(2, Math.min(100, axis.score))
        return (
          <li key={axis.key} className="risk-meter-row">
            <div className="risk-meter-head">
              <span className="risk-meter-label">{axis.label}</span>
              <span className="risk-meter-score">{axis.score}</span>
            </div>
            <div className="risk-meter-track">
              <div
                className="risk-meter-fill"
                style={{ width: `${pct}%`, background: barColor(axis.score) }}
              />
            </div>
            <div className="risk-meter-detail">
              <span>{axis.detail}</span>
              <span className="risk-meter-weight">
                weight {Math.round(axis.weight * 100)}%
              </span>
            </div>
            {axis.why && <p className="risk-meter-why">{axis.why}</p>}
          </li>
        )
      })}
    </ul>
  )
}
