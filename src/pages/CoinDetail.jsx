import { Link, useParams } from 'react-router-dom'
import { getCoin } from '../data/stablecoins.js'
import { scoreStablecoin } from '../utils/riskEngine.js'
import { formatUsdCompact } from '../utils/format.js'
import RiskBadge from '../components/RiskBadge.jsx'
import CoinGlyph from '../components/CoinGlyph.jsx'
import RiskMeter from '../components/RiskMeter.jsx'
import PegChart from '../components/PegChart.jsx'

export default function CoinDetail() {
  const { id } = useParams()
  const coin = getCoin(id)

  if (!coin) {
    return (
      <div className="container page">
        <h1 className="page-title">Coin not found</h1>
        <p className="muted">
          We don't have data for "{id}". Head back to the{' '}
          <Link to="/compare">comparison table</Link>.
        </p>
      </div>
    )
  }

  const review = scoreStablecoin(coin)

  return (
    <div className="container page coin-detail">
      <p className="breadcrumb">
        <Link to="/compare" className="muted-link">← All stablecoins</Link>
      </p>

      <header className="coin-head">
        <div className="coin-head-main">
          <CoinGlyph coin={coin} size="lg" />
          <div>
            <h1 className="page-title coin-title">
              {coin.name}{' '}
              <span className="coin-symbol muted">{coin.symbol}</span>
            </h1>
            <p className="muted coin-issuer">
              Issued by <strong>{coin.issuer}</strong>
              {coin.marketCapApprox ? (
                <>
                  {' '}· market cap{' '}
                  <span className="mono">{formatUsdCompact(coin.marketCapApprox)}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="coin-head-actions">
          <Link to={`/send?coin=${coin.id}`} className="btn btn-primary">
            Send {coin.symbol}
          </Link>
          <Link to="/risk" className="btn btn-ghost">Risk checker</Link>
        </div>
      </header>

      <section className="coin-grid">
        <div className="card coin-score-card">
          <div className="coin-score-head">
            <div>
              <div className="muted small">Overall risk score</div>
              <div className="coin-score-num">
                {review.overall}
                <span className="coin-score-suffix">/100</span>
              </div>
            </div>
            <RiskBadge level={review.level} />
          </div>
          <p className="coin-score-note muted small">
            Higher = lower risk. Computed from peg history, backing, regulatory
            clarity, liquidity, and smart-contract risk.
          </p>
          <RiskMeter axes={review.axes} />
        </div>

        <div className="coin-side">
          <div className="card">
            <h3 className="coin-section-title">Peg behaviour</h3>
            <PegChart coinId={coin.id} color={coin.color} />
            <p className="muted small">{coin.pegHistoryNote}</p>
          </div>

          <div className="card">
            <h3 className="coin-section-title">Backing</h3>
            <p className="muted">{coin.backingDetail}</p>
            <ul className="coin-meta-list">
              <li>
                <span className="muted small">Yield-bearing</span>
                <span>{coin.yieldBearing ? 'Yes' : 'No'}</span>
              </li>
              <li>
                <span className="muted small">Decimals</span>
                <span>{coin.decimals}</span>
              </li>
              <li>
                <span className="muted small">Chains</span>
                <span>{coin.chains?.join(', ')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="coin-pros-cons">
        <div className="card pros-card">
          <h3 className="coin-section-title">
            <span aria-hidden>✅</span> Why people use it
          </h3>
          <ul className="pros-list">
            {coin.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="card cons-card">
          <h3 className="coin-section-title">
            <span aria-hidden>⚠️</span> What to watch
          </h3>
          <ul className="cons-list">
            {coin.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card coin-cta">
        <div>
          <h3 className="coin-section-title">Ready to try a payment?</h3>
          <p className="muted">
            Run the AI pre-flight check before you send {coin.symbol}. Everything
            is simulated — no real funds move.
          </p>
        </div>
        <div className="coin-cta-actions">
          <Link to={`/send?coin=${coin.id}`} className="btn btn-primary">
            Simulate sending {coin.symbol}
          </Link>
          <Link to="/assistant" className="btn btn-ghost">
            Ask the AI buddy
          </Link>
        </div>
      </section>
    </div>
  )
}
