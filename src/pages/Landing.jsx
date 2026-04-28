import { Link } from 'react-router-dom'

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

export default function Landing() {
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
