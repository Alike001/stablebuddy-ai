import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import PageLoading from './components/PageLoading.jsx'
import Landing from './pages/Landing.jsx'

// Lazy-loaded routes — keeps the initial bundle small. Recharts and other
// heavier deps only ship when their page is visited.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const CoinDetail = lazy(() => import('./pages/CoinDetail.jsx'))
const Send = lazy(() => import('./pages/Send.jsx'))
const Invoice = lazy(() => import('./pages/Invoice.jsx'))
const PayInvoice = lazy(() => import('./pages/PayInvoice.jsx'))
const Assistant = lazy(() => import('./pages/Assistant.jsx'))
const Risk = lazy(() => import('./pages/Risk.jsx'))
const History = lazy(() => import('./pages/History.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<PageLoading />}>
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
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
