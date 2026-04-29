import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { STABLECOINS, getCoin } from '../data/stablecoins.js'
import { useStore } from '../utils/useStore.js'
import { upsertInvoice } from '../utils/storage.js'
import { buildInvoiceUrl } from '../utils/invoice.js'
import {
  formatUsd,
  formatTokenAmount,
  formatAddress,
  formatRelativeTime,
  shortId,
} from '../utils/format.js'
import CoinGlyph from '../components/CoinGlyph.jsx'
import EmptyState from '../components/EmptyState.jsx'

const STATUS_TONE = {
  open: 'risk-badge-info',
  paid: 'risk-badge-success',
  expired: 'risk-badge-warning',
}

function todayPlus(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function Invoice() {
  const state = useStore()
  const wallet = state.wallet
  const invoices = state.invoices || []

  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [coinId, setCoinId] = useState('usdc')
  const [memo, setMemo] = useState('')
  const [dueDate, setDueDate] = useState(todayPlus(7))
  const [generated, setGenerated] = useState(null)
  const [copied, setCopied] = useState(false)

  const coin = getCoin(coinId)
  const numericAmount = Number(amount)
  const validForm =
    payee.trim().length > 0 &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0

  const onCreate = (e) => {
    e.preventDefault()
    if (!validForm) return
    const invoice = {
      id: shortId('inv'),
      payee: payee.trim(),
      payeeAddress: wallet.address,
      amount: numericAmount,
      coin: coinId,
      memo: memo.trim() || null,
      dueDate,
      status: 'open',
      createdAt: Date.now(),
    }
    upsertInvoice(invoice)
    setGenerated({ invoice, url: buildInvoiceUrl(invoice) })
    setCopied(false)
  }

  const onCopy = async () => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard might be blocked — user can still select the input manually
    }
  }

  const onCreateAnother = () => {
    setPayee('')
    setAmount('')
    setMemo('')
    setDueDate(todayPlus(7))
    setGenerated(null)
    setCopied(false)
  }

  const sortedInvoices = useMemo(
    () => [...invoices].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [invoices],
  )

  return (
    <div className="container page invoice-page">
      <header className="invoice-head">
        <div>
          <span className="badge">Stablecoin invoice</span>
          <h1 className="page-title">Create an invoice</h1>
          <p className="muted">
            Share a link. The payer opens it, sees the AI risk check, and pays
            in one click — all simulated.
          </p>
        </div>
      </header>

      <div className="invoice-grid">
        <div className="card invoice-form-card">
          {generated ? (
            <div className="invoice-generated">
              <h3 className="invoice-section-title">
                <span aria-hidden>🔗</span> Invoice ready to share
              </h3>
              <p className="muted">
                {generated.invoice.payee} · request for{' '}
                <strong>
                  {formatTokenAmount(generated.invoice.amount, coin?.symbol)}
                </strong>
                {' '}({formatUsd(generated.invoice.amount)} at peg).
              </p>
              <label className="invoice-field">
                <span className="invoice-field-label">Shareable link</span>
                <div className="invoice-link-row">
                  <input
                    type="text"
                    readOnly
                    className="send-input mono invoice-link-input"
                    value={generated.url}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onCopy}
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
                <span className="muted small">
                  The full invoice payload is encoded in the URL — no backend
                  required.
                </span>
              </label>
              <div className="invoice-generated-actions">
                <Link
                  to={`/invoice/pay?d=${generated.url.split('d=')[1]}`}
                  className="btn btn-ghost"
                >
                  Preview pay page →
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onCreateAnother}
                >
                  Create another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onCreate} className="invoice-form">
              <label className="invoice-field">
                <span className="invoice-field-label">Payee name</span>
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="Your name or business"
                  className="send-input"
                  maxLength={60}
                />
              </label>

              <div className="invoice-row-2">
                <label className="invoice-field">
                  <span className="invoice-field-label">Amount</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="send-input"
                  />
                </label>
                <label className="invoice-field">
                  <span className="invoice-field-label">Stablecoin</span>
                  <select
                    value={coinId}
                    onChange={(e) => setCoinId(e.target.value)}
                    className="send-input"
                  >
                    {STABLECOINS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.symbol} — {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="invoice-field">
                <span className="invoice-field-label">
                  Memo <span className="muted small">(optional)</span>
                </span>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="What's this invoice for?"
                  className="send-input"
                  maxLength={80}
                />
              </label>

              <label className="invoice-field">
                <span className="invoice-field-label">Due date</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="send-input"
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={!validForm}
              >
                Generate invoice link
              </button>
            </form>
          )}
        </div>

        <aside className="card invoice-side">
          <h3 className="invoice-section-title">How it works</h3>
          <ol className="invoice-steps">
            <li>
              <strong>Fill the form</strong>
              <span className="muted small">
                Payee name, amount, stablecoin, due date.
              </span>
            </li>
            <li>
              <strong>Get a link</strong>
              <span className="muted small">
                The full invoice is encoded in the URL — no backend.
              </span>
            </li>
            <li>
              <strong>Payer reviews + pays</strong>
              <span className="muted small">
                The AI runs a pre-flight check before they confirm.
              </span>
            </li>
          </ol>
        </aside>
      </div>

      <section className="invoice-list-section">
        <div className="invoice-list-head">
          <h2 className="dash-activity-title">Saved invoices</h2>
          <span className="muted small">
            Stored locally — only on this browser.
          </span>
        </div>
        <div className="card">
          {sortedInvoices.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No invoices yet"
              body="Generate one above and your saved invoices will appear here."
            />
          ) : (
            <ul className="invoice-list">
              {sortedInvoices.map((inv) => {
                const c = getCoin(inv.coin)
                const url = buildInvoiceUrl(inv)
                const tone = STATUS_TONE[inv.status] || 'risk-badge-info'
                return (
                  <li key={inv.id} className="invoice-row">
                    <div className="invoice-row-main">
                      <CoinGlyph coin={c} />
                      <div>
                        <div className="invoice-row-title">
                          {inv.payee}{' '}
                          <span className={`risk-badge is-compact ${tone}`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="muted small">
                          {inv.memo ? `${inv.memo} · ` : ''}due {inv.dueDate} ·
                          created {formatRelativeTime(inv.createdAt)}
                        </div>
                        <div className="muted small mono">
                          to {formatAddress(inv.payeeAddress)}
                        </div>
                      </div>
                    </div>
                    <div className="invoice-row-side">
                      <div className="invoice-row-amount">
                        {formatTokenAmount(inv.amount, c?.symbol)}
                      </div>
                      <div className="muted small">{formatUsd(inv.amount)}</div>
                      {inv.status === 'open' ? (
                        <Link
                          to={`/invoice/pay?d=${url.split('d=')[1]}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Open pay page
                        </Link>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
