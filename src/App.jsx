import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Placeholder({ title }) {
  return (
    <div className="container page">
      <h1 className="page-title">{title}</h1>
      <p className="muted">Coming up in the next build step.</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/compare" element={<Placeholder title="Compare stablecoins" />} />
          <Route path="/compare/:id" element={<Placeholder title="Coin detail" />} />
          <Route path="/send" element={<Placeholder title="Send / Pay" />} />
          <Route path="/invoice" element={<Placeholder title="Invoice generator" />} />
          <Route path="/invoice/pay" element={<Placeholder title="Pay invoice" />} />
          <Route path="/assistant" element={<Placeholder title="AI assistant" />} />
          <Route path="/risk" element={<Placeholder title="Risk checker" />} />
          <Route path="/history" element={<Placeholder title="Transaction history" />} />
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
