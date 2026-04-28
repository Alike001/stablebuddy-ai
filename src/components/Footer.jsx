export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-text">
          <strong>StableBuddy AI</strong> — Prototype for the DeFi Hackathon.
          Simulated wallet, no real funds.
        </p>
        <p className="footer-meta">© {new Date().getFullYear()} StableBuddy AI</p>
      </div>
    </footer>
  )
}
