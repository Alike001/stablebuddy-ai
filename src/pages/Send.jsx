import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { STABLECOINS, getCoin } from '../data/stablecoins.js'
import { useStore } from '../utils/useStore.js'
import { addTransaction, setBalance } from '../utils/storage.js'
import { preflightPayment } from '../utils/riskEngine.js'
import {
  formatUsd,
  formatTokenAmount,
  formatAddress,
  shortId,
} from '../utils/format.js'
import RiskBadge from '../components/RiskBadge.jsx'
import CoinGlyph from '../components/CoinGlyph.jsx'
import EmptyState from '../components/EmptyState.jsx'

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

function recentRecipients(state, limit = 4) {
  const seen = new Map()
  for (const tx of state.transactions || []) {
    if (tx.type !== 'send' || !tx.to) continue
    if (!seen.has(tx.to)) seen.set(tx.to, { address: tx.to, memo: tx.memo })
    if (seen.size >= limit) break
  }
  return [...seen.values()]
}

export default function Send() {
  const state = useStore()
  const [params] = useSearchParams()
  const initialCoin = params.get('coin') || 'usdc'

  const [coinId, setCoinId] = useState(initialCoin)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')
  const [phase, setPhase] = useState('compose') // compose | confirming | sent
  const [lastTx, setLastTx] = useState(null)

  const coin = getCoin(coinId) || STABLECOINS[0]
  const balance = Number(state.wallet?.balances?.[coinId] || 0)
  const numericAmount = Number(amount)
  const knownAddresses = useMemo(() => knownAddressesFromState(state), [state])
  const recents = useMemo(() => recentRecipients(state), [state])

  const review = useMemo(
    () =>
      preflightPayment({
        coin,
        amount: numericAmount,
        recipient,
        knownAddresses,
      }),
    [coin, numericAmount, recipient, knownAddresses],
  )

  const insufficient =
    Number.isFinite(numericAmount) && numericAmount > balance && numericAmount > 0
  const validBasics =
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    recipient.trim().length >= 10
  const blockingIssue = review.issues.some((i) => i.level === 'danger')
  const canReview = validBasics && !insufficient && !blockingIssue

  const onReview = (e) => {
    e.preventDefault()
    if (!canReview) return
    setPhase('confirming')
  }

  const onConfirm = () => {
    if (!canReview) return
    const newBalance = balance - numericAmount
    setBalance(coinId, newBalance)
    const tx = {
      id: shortId('tx'),
      type: 'send',
      coin: coinId,
      amount: numericAmount,
      from: state.wallet.address,
      to: recipient.trim(),
      memo: memo.trim() || null,
      timestamp: Date.now(),
      status: 'completed',
      riskCheck: { overall: review.overall, level: review.level.level },
    }
    addTransaction(tx)
    setLastTx(tx)
    setPhase('sent')
  }

  const onSendAnother = () => {
    setAmount('')
    setRecipient('')
    setMemo('')
    setLastTx(null)
    setPhase('compose')
  }

  const totalUsd = numericAmount > 0 ? numericAmount : 0

  if (phase === 'sent' && lastTx) {
    const sentCoin = getCoin(lastTx.coin)
    return (
      <div className="container page send-page">
        <div className="card send-success">
          <div className="send-success-icon" aria-hidden>✅</div>
          <h1 className="page-title">Payment sent (simulated)</h1>
          <p className="muted">
            {formatTokenAmount(lastTx.amount, sentCoin?.symbol)} to{' '}
            <span className="mono">{formatAddress(lastTx.to)}</span>.
          </p>
          <ul className="send-summary">
            <li>
              <span className="muted small">Risk score at send</span>
              <RiskBadge
                level={{
                  level: lastTx.riskCheck.level,
                  label: review.level.label,
                  tone: review.level.tone,
                }}
                score={lastTx.riskCheck.overall}
                compact
              />
            </li>
            <li>
              <span className="muted small">Reference</span>
              <span className="mono">{lastTx.id}</span>
            </li>
            <li>
              <span className="muted small">New {sentCoin?.symbol} balance</span>
              <span className="mono">
                {formatTokenAmount(
                  state.wallet.balances?.[lastTx.coin] || 0,
                  sentCoin?.symbol,
                )}
              </span>
            </li>
          </ul>
          <div className="send-success-actions">
            <button className="btn btn-primary" onClick={onSendAnother}>
              Send another
            </button>
            <Link to="/history" className="btn btn-ghost">View history</Link>
            <Link to="/dashboard" className="btn btn-ghost">Back to dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  if (balance === 0 && !state.transactions?.length) {
    return (
      <div className="container page send-page">
        <h1 className="page-title">Send a payment</h1>
        <div className="card">
          <EmptyState
            icon="💸"
            title="Your wallet is empty"
            body="Load demo data to try the simulated send flow with a starter balance and contacts."
            action={
              <Link to="/dashboard" className="btn btn-primary">
                Go to dashboard
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container page send-page">
      <header className="send-head">
        <div>
          <span className="badge">Simulated send</span>
          <h1 className="page-title">Send a payment</h1>
          <p className="muted">
            StableBuddy runs an AI pre-flight check before you confirm. No real
            funds move.
          </p>
        </div>
      </header>

      <div className="send-grid">
        <form className="card send-form" onSubmit={onReview}>
          <fieldset disabled={phase === 'confirming'} className="send-fieldset">
            <label className="send-field">
              <span className="send-field-label">Stablecoin</span>
              <div className="send-coin-row">
                <select
                  value={coinId}
                  onChange={(e) => setCoinId(e.target.value)}
                  className="send-input"
                >
                  {STABLECOINS.map((c) => {
                    const bal = Number(state.wallet.balances?.[c.id] || 0)
                    return (
                      <option key={c.id} value={c.id}>
                        {c.symbol} — {c.name} (balance {bal})
                      </option>
                    )
                  })}
                </select>
                <CoinGlyph coin={coin} />
              </div>
              <span className="send-help muted small">
                Available: {formatTokenAmount(balance, coin.symbol)} ·{' '}
                <Link to={`/compare/${coin.id}`} className="muted-link">
                  See risk profile →
                </Link>
              </span>
            </label>

            <label className="send-field">
              <span className="send-field-label">Amount</span>
              <div className="send-amount-row">
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
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAmount(String(balance))}
                  disabled={balance === 0}
                >
                  Max
                </button>
              </div>
              {insufficient && (
                <span className="send-help send-help-error">
                  Not enough {coin.symbol}. You have{' '}
                  {formatTokenAmount(balance, coin.symbol)}.
                </span>
              )}
              {!insufficient && numericAmount > 0 && (
                <span className="send-help muted small">
                  ≈ {formatUsd(totalUsd)} at $1.00 peg
                </span>
              )}
            </label>

            <label className="send-field">
              <span className="send-field-label">Recipient address</span>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x… (paste any address)"
                className="send-input mono"
                autoComplete="off"
              />
              {recents.length > 0 && (
                <div className="send-recents">
                  <span className="muted small">Recent:</span>
                  {recents.map((r) => (
                    <button
                      key={r.address}
                      type="button"
                      className="send-recent-pill"
                      onClick={() => setRecipient(r.address)}
                    >
                      <span className="mono">{formatAddress(r.address)}</span>
                      {r.memo && <span className="muted small">— {r.memo}</span>}
                    </button>
                  ))}
                </div>
              )}
            </label>

            <label className="send-field">
              <span className="send-field-label">
                Memo <span className="muted small">(optional)</span>
              </span>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="What's this for?"
                className="send-input"
                maxLength={80}
              />
            </label>

            {phase === 'compose' && (
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={!canReview}
              >
                Review and confirm
              </button>
            )}
          </fieldset>

          {phase === 'confirming' && (
            <div className="send-confirm">
              <h3 className="send-confirm-title">Final review</h3>
              <ul className="send-confirm-list">
                <li>
                  <span className="muted small">Sending</span>
                  <strong>{formatTokenAmount(numericAmount, coin.symbol)}</strong>
                </li>
                <li>
                  <span className="muted small">To</span>
                  <span className="mono">{recipient.trim()}</span>
                </li>
                {memo && (
                  <li>
                    <span className="muted small">Memo</span>
                    <span>{memo}</span>
                  </li>
                )}
                <li>
                  <span className="muted small">AI risk score</span>
                  <RiskBadge level={review.level} score={review.overall} compact />
                </li>
              </ul>
              <p className="muted small">
                This is a simulated payment. Your local balance will update and a
                transaction record will be saved.
              </p>
              <div className="send-confirm-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setPhase('compose')}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onConfirm}
                >
                  Confirm send
                </button>
              </div>
            </div>
          )}
        </form>

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

          {review.issues.length === 0 ? (
            <p className="muted small">Fill the form and we'll review it live.</p>
          ) : (
            <ul className="send-issues">
              {review.issues.map((issue, idx) => (
                <li key={idx} className={`send-issue ${ISSUE_TONE[issue.level] || ''}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
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

          {review.coinReview && (
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
          )}
        </aside>
      </div>
    </div>
  )
}
