import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCoin } from '../data/stablecoins.js'
import { useStore } from '../utils/useStore.js'
import { addTransaction, setBalance, upsertInvoice } from '../utils/storage.js'
import { decodeInvoice } from '../utils/invoice.js'
import { preflightPayment } from '../utils/riskEngine.js'
import {
  formatUsd,
  formatTokenAmount,
  formatAddress,
  shortId,
} from '../utils/format.js'
import RiskBadge from '../components/RiskBadge.jsx'
import CoinGlyph from '../components/CoinGlyph.jsx'

const ISSUE_TONE = {
  danger: 'risk-badge-danger',
  warning: 'risk-badge-warning',
  info: 'risk-badge-info',
}

function knownAddressesFromState(state) {
  const set = new Set()
  for (const tx of state.transactions || []) {
    if (tx.type === 'send' && tx.to) set.add(tx.to)
    if (tx.type === 'receive' && tx.from) set.add(tx.from)
  }
  return [...set]
}

export default function PayInvoice() {
  const state = useStore()
  const [params] = useSearchParams()
  const token = params.get('d')
  const invoice = useMemo(() => (token ? decodeInvoice(token) : null), [token])

  const [phase, setPhase] = useState('review') // review | sent
  const [paidTx, setPaidTx] = useState(null)

  const coin = invoice ? getCoin(invoice.coin) : null
  const balance = invoice ? Number(state.wallet?.balances?.[invoice.coin] || 0) : 0
  const knownAddresses = useMemo(() => knownAddressesFromState(state), [state])

  const review = useMemo(() => {
    if (!invoice || !coin) return null
    return preflightPayment({
      coin,
      amount: invoice.amount,
      recipient: invoice.payeeAddress,
      knownAddresses,
    })
  }, [invoice, coin, knownAddresses])

  if (!token || !invoice || !coin) {
    return (
      <div className="container page invoice-page">
        <h1 className="page-title">Invoice not found</h1>
        <p className="muted">
          This link is missing or its data could not be decoded. Ask the payee
          to send a fresh link, or{' '}
          <Link to="/invoice" className="muted-link">create a new invoice</Link>.
        </p>
      </div>
    )
  }

  const insufficient = invoice.amount > balance
  const blockingIssue = review?.issues.some((i) => i.level === 'danger')
  const canPay = !insufficient && !blockingIssue && balance > 0

  const onPay = () => {
    if (!canPay) return
    const newBalance = balance - invoice.amount
    setBalance(invoice.coin, newBalance)

    const tx = {
      id: shortId('tx'),
      type: 'send',
      coin: invoice.coin,
      amount: invoice.amount,
      from: state.wallet.address,
      to: invoice.payeeAddress,
      memo: invoice.memo
        ? `Invoice: ${invoice.memo}`
        : `Invoice for ${invoice.payee}`,
      timestamp: Date.now(),
      status: 'completed',
      invoiceId: invoice.id,
      riskCheck: { overall: review.overall, level: review.level.level },
    }
    addTransaction(tx)
    upsertInvoice({
      ...invoice,
      status: 'paid',
      paidAt: Date.now(),
      paidTxId: tx.id,
    })
    setPaidTx(tx)
    setPhase('sent')
  }

  if (phase === 'sent' && paidTx) {
    return (
      <div className="container page invoice-page">
        <div className="card send-success">
          <div className="send-success-icon" aria-hidden>✅</div>
          <h1 className="page-title">Invoice paid (simulated)</h1>
          <p className="muted">
            {formatTokenAmount(paidTx.amount, coin.symbol)} sent to{' '}
            <strong>{invoice.payee}</strong>.
          </p>
          <ul className="send-summary">
            <li>
              <span className="muted small">Risk score at pay</span>
              <span className="mono">{paidTx.riskCheck.overall}/100</span>
            </li>
            <li>
              <span className="muted small">Reference</span>
              <span className="mono">{paidTx.id}</span>
            </li>
            <li>
              <span className="muted small">Invoice ID</span>
              <span className="mono">{invoice.id}</span>
            </li>
          </ul>
          <div className="send-success-actions">
            <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
            <Link to="/history" className="btn btn-ghost">View history</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container page invoice-page">
      <p className="breadcrumb">
        <Link to="/invoice" className="muted-link">← Invoices</Link>
      </p>

      <header className="invoice-head">
        <div>
          <span className="badge">Pay invoice</span>
          <h1 className="page-title">
            {invoice.payee} requests {formatTokenAmount(invoice.amount, coin.symbol)}
          </h1>
          <p className="muted">
            ≈ {formatUsd(invoice.amount)} at peg · due {invoice.dueDate}
          </p>
        </div>
      </header>

      <div className="send-grid">
        <div className="card pay-summary">
          <h3 className="invoice-section-title">Invoice</h3>
          <ul className="send-confirm-list">
            <li>
              <span className="muted small">Payee</span>
              <strong>{invoice.payee}</strong>
            </li>
            <li>
              <span className="muted small">To address</span>
              <span className="mono">{formatAddress(invoice.payeeAddress)}</span>
            </li>
            <li>
              <span className="muted small">Amount</span>
              <span className="pay-amount">
                <CoinGlyph coin={coin} />
                <strong>{formatTokenAmount(invoice.amount, coin.symbol)}</strong>
              </span>
            </li>
            {invoice.memo && (
              <li>
                <span className="muted small">Memo</span>
                <span>{invoice.memo}</span>
              </li>
            )}
            <li>
              <span className="muted small">Due date</span>
              <span>{invoice.dueDate}</span>
            </li>
            <li>
              <span className="muted small">Your {coin.symbol} balance</span>
              <span className={insufficient ? 'pay-balance-low' : ''}>
                {formatTokenAmount(balance, coin.symbol)}
              </span>
            </li>
          </ul>

          {invoice.status === 'paid' ? (
            <p className="pay-already-note">
              ✅ This invoice has already been marked as paid in this browser.
              Paying it again would create a duplicate transaction.
            </p>
          ) : insufficient ? (
            <p className="send-help-error">
              You don't have enough {coin.symbol} in the simulated wallet. Try a
              smaller demo invoice or load demo data.
            </p>
          ) : null}

          <div className="pay-actions">
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!canPay || invoice.status === 'paid'}
              onClick={onPay}
            >
              Pay {formatTokenAmount(invoice.amount, coin.symbol)} now
            </button>
            <Link to="/dashboard" className="btn btn-ghost btn-block">
              Cancel
            </Link>
          </div>
        </div>

        <aside className="card send-preflight">
          <div className="send-preflight-head">
            <div>
              <div className="muted small">AI pre-flight check</div>
              <div className="send-preflight-score">
                {review.overall}
                <span className="send-preflight-suffix">/100</span>
              </div>
            </div>
            <RiskBadge level={review.level} />
          </div>

          {review.issues.length > 0 ? (
            <ul className="send-issues">
              {review.issues.map((issue, idx) => (
                <li key={idx} className={`send-issue ${ISSUE_TONE[issue.level] || ''}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">No flags — invoice looks routine.</p>
          )}

          {review.checklist.length > 0 && (
            <>
              <div className="send-preflight-sub muted small">Checklist</div>
              <ul className="send-checklist">
                {review.checklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <div className="send-coin-recap">
            <div className="muted small">{coin.symbol} risk profile</div>
            <RiskBadge
              level={review.coinReview.level}
              score={review.coinReview.overall}
              compact
            />
            <Link to={`/compare/${coin.id}`} className="muted-link small">
              See full breakdown →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
