import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/compare', label: 'Compare' },
  { to: '/send', label: 'Send' },
  { to: '/invoice', label: 'Invoice' },
  { to: '/assistant', label: 'AI Assistant' },
  { to: '/risk', label: 'Risk' },
  { to: '/history', label: 'History' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">SB</span>
          <span className="brand-name">StableBuddy <span className="brand-ai">AI</span></span>
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
