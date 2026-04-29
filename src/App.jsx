import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Compare from './pages/Compare.jsx'
import CoinDetail from './pages/CoinDetail.jsx'
import Send from './pages/Send.jsx'
import Invoice from './pages/Invoice.jsx'
import PayInvoice from './pages/PayInvoice.jsx'
import Assistant from './pages/Assistant.jsx'
import Risk from './pages/Risk.jsx'

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
          <Route path="/compare" element={<Compare />} />
          <Route path="/compare/:id" element={<CoinDetail />} />
          <Route path="/send" element={<Send />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/invoice/pay" element={<PayInvoice />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/history" element={<Placeholder title="Transaction history" />} />
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
