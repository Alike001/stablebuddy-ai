import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { STABLECOINS, getCoin } from '../data/stablecoins.js'
import {
  BACKING_SCORES,
  REGULATORY_SCORES,
  CONTRACT_SCORES,
  RISK_WEIGHTS,
  liquidityScore,
} from '../data/riskRules.js'
import { scoreStablecoin } from '../utils/riskEngine.js'
import RiskBadge from '../components/RiskBadge.jsx'
import RiskMeter from '../components/RiskMeter.jsx'
import CoinGlyph from '../components/CoinGlyph.jsx'
import { formatUsdCompact } from '../utils/format.js'

const LIQUIDITY_TIERS = [
  { id: '50b', min: 50_000_000_000, label: '$50B+' },
  { id: '10b', min: 10_000_000_000, label: '$10B – $50B' },
  { id: '2b', min: 2_000_000_000, label: '$2B – $10B' },
  { id: '500m', min: 500_000_000, label: '$500M – $2B' },
  { id: '100m', min: 100_000_000, label: '$100M – $500M' },
  { id: 'sub', min: 0, label: 'under $100M' },
]

function tierForMarketCap(mc) {
  for (const t of LIQUIDITY_TIERS) {
    if (mc >= t.min) return t
  }
  return LIQUIDITY_TIERS[LIQUIDITY_TIERS.length - 1]
}

function RuleTable({ title, entries, activeKey, format = (e) => e.label }) {
  return (
    <div className="card rule-card">
      <h3 className="rule-title">{title}</h3>
      <ul className="rule-list">
        {entries.map((entry) => {
          const isActive = entry.key === activeKey
          return (
            <li
              key={entry.key}
              className={`rule-row ${isActive ? 'is-active' : ''}`}
            >
              <span className="rule-row-main">
                <span className="rule-score">{entry.score}</span>
                <span className="rule-label">{format(entry)}</span>
              </span>
              {entry.why && <span className="rule-why muted small">{entry.why}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Risk() {
  const [selectedId, setSelectedId] = useState('usdc')
  const coin = getCoin(selectedId) || STABLECOINS[0]
  const review = useMemo(() => scoreStablecoin(coin), [coin])

  // Hypothetical builder
  const [hBacking, setHBacking] = useState(coin.backing)
  const [hReg, setHReg] = useState(coin.regulatory)
  const [hContract, setHContract] = useState(coin.contractRisk)
  const [hMarketCap, setHMarketCap] = useState(coin.marketCapApprox)

  const hypoCoin = useMemo(
    () => ({
      id: 'hypothetical',
      backing: hBacking,
      regulatory: hReg,
      contractRisk: hContract,
      marketCapApprox: hMarketCap,
    }),
    [hBacking, hReg, hContract, hMarketCap],
  )

  const hypoReview = useMemo(() => scoreStablecoin(hypoCoin), [hypoCoin])

  const onSyncFromCoin = () => {
    setHBacking(coin.backing)
    setHReg(coin.regulatory)
    setHContract(coin.contractRisk)
    setHMarketCap(coin.marketCapApprox)
  }

  const backingEntries = Object.entries(BACKING_SCORES).map(([key, v]) => ({ key, ...v }))
  const regEntries = Object.entries(REGULATORY_SCORES).map(([key, v]) => ({ key, ...v }))
  const contractEntries = Object.entries(CONTRACT_SCORES).map(([key, v]) => ({ key, ...v }))
  const liquidityEntries = LIQUIDITY_TIERS.map((t) => {
    const probe = liquidityScore(t.min)
    return { key: t.id, score: probe.score, label: `${t.label} — ${probe.label}` }
  })
  const activeLiquidityKey = tierForMarketCap(coin.marketCapApprox).id

  return (
    <div className="container page risk-page">
      <header className="risk-head">
        <div>
          <span className="badge">Risk lab</span>
          <h1 className="page-title">Risk checker</h1>
          <p className="muted">
            Inspect any stablecoin, see exactly how the score is built, then
            build a hypothetical to feel how the inputs interact.
          </p>
        </div>
        <Link to="/compare" className="btn btn-ghost">All stablecoins →</Link>
      </header>

      <section className="card risk-inspect">
        <div className="risk-inspect-head">
          <label className="risk-coin-picker">
            <span className="risk-coin-picker-label muted small">
              Inspect coin
            </span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="send-input"
            >
              {STABLECOINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} — {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="risk-inspect-meta">
            <CoinGlyph coin={coin} size="lg" />
            <div>
              <div className="risk-inspect-name">
                {coin.name} <span className="muted">{coin.symbol}</span>
              </div>
              <div className="muted small">Issued by {coin.issuer}</div>
            </div>
          </div>

          <div className="risk-inspect-score">
            <div className="muted small">Risk score</div>
            <div className="risk-inspect-score-num">
              {review.overall}
              <span className="risk-inspect-score-suffix">/100</span>
            </div>
            <RiskBadge level={review.level} />
          </div>
        </div>

        <RiskMeter axes={review.axes} />

        <p className="muted small risk-explain">
          Each axis carries a fixed weight (peg {Math.round(RISK_WEIGHTS.pegStability * 100)}% ·
          backing {Math.round(RISK_WEIGHTS.backingType * 100)}% ·
          regulatory {Math.round(RISK_WEIGHTS.regulatoryClarity * 100)}% ·
          liquidity {Math.round(RISK_WEIGHTS.liquidity * 100)}% ·
          contract {Math.round(RISK_WEIGHTS.smartContractRisk * 100)}%). The
          overall score is just a weighted average — nothing hidden.
        </p>
      </section>

      <section className="risk-rules">
        <div className="risk-rules-head">
          <h2 className="dash-activity-title">How each axis is scored</h2>
          <p className="muted small">
            The {coin.symbol} row in each table is highlighted.
          </p>
        </div>
        <div className="risk-rules-grid">
          <RuleTable
            title="Backing type"
            entries={backingEntries}
            activeKey={coin.backing}
          />
          <RuleTable
            title="Regulatory clarity"
            entries={regEntries}
            activeKey={coin.regulatory}
          />
          <RuleTable
            title="Smart-contract risk"
            entries={contractEntries}
            activeKey={coin.contractRisk}
          />
          <RuleTable
            title="Liquidity tiers"
            entries={liquidityEntries}
            activeKey={activeLiquidityKey}
          />
        </div>
      </section>

      <section className="card risk-hypothetical">
        <div className="risk-hypo-head">
          <div>
            <h2 className="dash-activity-title">Score a hypothetical</h2>
            <p className="muted small">
              Change the inputs and watch the score move. Useful for: "what if a
              new issuer launched in the EU with crypto backing?"
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onSyncFromCoin}
          >
            Reset to {coin.symbol}
          </button>
        </div>

        <div className="risk-hypo-grid">
          <div className="risk-hypo-controls">
            <label className="send-field">
              <span className="send-field-label">Backing</span>
              <select
                value={hBacking}
                onChange={(e) => setHBacking(e.target.value)}
                className="send-input"
              >
                {Object.entries(BACKING_SCORES).map(([key, v]) => (
                  <option key={key} value={key}>
                    {v.label} — {v.score}
                  </option>
                ))}
              </select>
            </label>

            <label className="send-field">
              <span className="send-field-label">Regulatory</span>
              <select
                value={hReg}
                onChange={(e) => setHReg(e.target.value)}
                className="send-input"
              >
                {Object.entries(REGULATORY_SCORES).map(([key, v]) => (
                  <option key={key} value={key}>
                    {v.label} — {v.score}
                  </option>
                ))}
              </select>
            </label>

            <label className="send-field">
              <span className="send-field-label">Smart-contract risk</span>
              <select
                value={hContract}
                onChange={(e) => setHContract(e.target.value)}
                className="send-input"
              >
                {Object.entries(CONTRACT_SCORES).map(([key, v]) => (
                  <option key={key} value={key}>
                    {v.label} — {v.score}
                  </option>
                ))}
              </select>
            </label>

            <label className="send-field">
              <span className="send-field-label">
                Market cap{' '}
                <span className="muted small">
                  {formatUsdCompact(hMarketCap)}
                </span>
              </span>
              <input
                type="range"
                min="50000000"
                max="100000000000"
                step="50000000"
                value={hMarketCap}
                onChange={(e) => setHMarketCap(Number(e.target.value))}
                className="risk-slider"
              />
            </label>
          </div>

          <div className="risk-hypo-result">
            <div className="risk-hypo-score-head">
              <div>
                <div className="muted small">Hypothetical score</div>
                <div className="risk-inspect-score-num">
                  {hypoReview.overall}
                  <span className="risk-inspect-score-suffix">/100</span>
                </div>
              </div>
              <RiskBadge level={hypoReview.level} />
            </div>
            <RiskMeter axes={hypoReview.axes} />
            <p className="muted small">
              Peg history is held constant at the default for unknown coins.
              Move backing → fiat and regulatory → US-regulated to climb to a
              "low risk" rating.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
