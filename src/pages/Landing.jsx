import { Link } from 'react-router-dom'
import { STABLECOINS } from '../data/stablecoins.js'
import { scoreStablecoin } from '../utils/riskEngine.js'
import RiskBadge from '../components/RiskBadge.jsx'
import CoinGlyph from '../components/CoinGlyph.jsx'

const features = [
  {
    title: 'Stablecoin comparison',
    body: 'See USDC, USDT, DAI, PYUSD, USDe and more side-by-side with a transparent risk score.',
    icon: '⚖️',
  },
  {
    title: 'AI risk pre-flight',
    body: 'Before you send a stablecoin payment, StableBuddy explains the risk in plain English.',
    icon: '🛡️',
  },
  {
    title: 'Shareable invoices',
    body: 'Generate a stablecoin invoice link in seconds. No backend, no signup.',
    icon: '🧾',
  },
  {
    title: 'Simulated wallet',
    body: 'Practice payments safely. Everything saved locally so you can experiment without real funds.',
    icon: '💼',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick a stablecoin',
    body: 'StableBuddy compares 8 major stablecoins on five risk axes — peg, backing, regulation, liquidity, smart-contract risk.',
  },
  {
    step: '02',
    title: 'Send or invoice',
    body: 'Generate a shareable invoice link, or simulate a send from your local wallet. The AI runs a pre-flight check before you confirm.',
  },
  {
    step: '03',
    title: 'Get a plain-English risk read',
    body: 'A grounded AI assistant explains why a coin is safe or risky, what to verify, and what to learn.',
  },
]

const PREVIEW_IDS = ['usdc', 'dai', 'usde', 'tusd']

export default function Landing() {
  const previewCoins = PREVIEW_IDS
    .map((id) => STABLECOINS.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({ coin: c, review: scoreStablecoin(c) }))

  return (
    <div className="landing">
      <section className="hero">
        <div className="container hero-inner">
          <span className="badge">DeFi Hackathon prototype</span>
          <h1 className="hero-title">
            Stablecoin payments,<br />explained by an AI buddy.
          </h1>
          <p className="hero-sub">
            StableBuddy AI helps you compare stablecoins, generate invoices,
            and run a plain-English risk check before every payment.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary">Open dashboard</Link>
            <Link to="/compare" className="btn btn-ghost">Compare stablecoins</Link>
          </div>
          <p className="hero-note">No wallet needed. No real funds. 100% local.</p>
        </div>
      </section>

      <section className="container stat-strip" aria-label="Highlights">
        <div className="stat">
          <span className="stat-num">{STABLECOINS.length}</span>
          <span className="stat-label">Stablecoins compared</span>
        </div>
        <div className="stat">
          <span className="stat-num">5</span>
          <span className="stat-label">Risk axes scored</span>
        </div>
        <div className="stat">
          <span className="stat-num">0</span>
          <span className="stat-label">Servers needed</span>
        </div>
        <div className="stat">
          <span className="stat-num">100%</span>
          <span className="stat-label">Plain English</span>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Why StableBuddy?</h2>
        <p className="section-sub">
          Stablecoins look the same on the surface — they don't behave the same.
          StableBuddy makes the differences obvious and the risks understandable.
        </p>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" aria-hidden>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">A peek at the risk engine</h2>
        <p className="section-sub">
          Every stablecoin gets a transparent score across five axes.
        </p>
        <div className="preview-grid">
          {previewCoins.map(({ coin, review }) => (
            <Link
              key={coin.id}
              to={`/compare/${coin.id}`}
              className="preview-card"
            >
              <div className="preview-card-head">
                <CoinGlyph coin={coin} />
                <div>
                  <div className="preview-symbol">{coin.symbol}</div>
                  <div className="preview-name">{coin.name}</div>
                </div>
              </div>
              <div className="preview-score">
                <span className="preview-score-num">{review.overall}</span>
                <span className="preview-score-suffix">/100</span>
              </div>
              <RiskBadge level={review.level} />
              <p className="preview-issuer">Issued by {coin.issuer}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">How it works</h2>
        <div className="steps-grid">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="step-card">
              <div className="step-num">{s.step}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section cta">
        <div className="cta-card">
          <h2>Try the demo flow</h2>
          <p>Generate an invoice, run an AI risk check, then send the simulated payment.</p>
          <div className="cta-actions">
            <Link to="/invoice" className="btn btn-primary">Create an invoice</Link>
            <Link to="/assistant" className="btn btn-ghost">Ask the AI buddy</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
