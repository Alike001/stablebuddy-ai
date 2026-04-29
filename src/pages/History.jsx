import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../utils/useStore.js'
import { getCoin, STABLECOINS } from '../data/stablecoins.js'
import {
  formatUsd,
  formatTokenAmount,
  formatAddress,
  formatRelativeTime,
  formatDate,
} from '../utils/format.js'
import { levelFromScore } from '../utils/riskEngine.js'
import CoinGlyph from '../components/CoinGlyph.jsx'
import RiskBadge from '../components/RiskBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'

const TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'send', label: 'Sent' },
  { id: 'receive', label: 'Received' },
]

function aggregate(transactions) {
  let sent = 0
  let received = 0
  const coins = new Set()
  for (const tx of transactions) {
    coins.add(tx.coin)
    const usd = Number(tx.amount) || 0
    if (tx.type === 'send') sent += usd
    else if (tx.type === 'receive') received += usd
  }
  return {
    sent,
    received,
    count: transactions.length,
    uniqueCoins: coins.size,
  }
}

export default function History() {
  const transactions = useStore((s) => s.transactions || [])
  const [type, setType] = useState('all')
  const [coinFilter, setCoinFilter] = useState('all')
  const [query, setQuery] = useState('')

  const usedCoinIds = useMemo(() => {
    const set = new Set(transactions.map((tx) => tx.coin))
    return STABLECOINS.filter((c) => set.has(c.id))
  }, [transactions])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions.filter((tx) => {
      if (type !== 'all' && tx.type !== type) return false
      if (coinFilter !== 'all' && tx.coin !== coinFilter) return false
      if (q) {
        const haystack = [
          tx.to || '',
          tx.from || '',
          tx.memo || '',
          tx.id || '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [transactions, type, coinFilter, query])

  const totals = useMemo(() => aggregate(transactions), [transactions])
  const filteredTotals = useMemo(() => aggregate(filtered), [filtered])

  const onReset = () => {
    setType('all')
    setCoinFilter('all')
    setQuery('')
  }

  if (transactions.length === 0) {
    return (
      <div className="container page history-page">
        <header className="history-head">
          <div>
            <span className="badge">Activity</span>
            <h1 className="page-title">Transaction history</h1>
            <p className="muted">
              Every simulated send and receive shows up here, with the risk
              score that was attached at the time.
            </p>
          </div>
        </header>
        <div className="card">
          <EmptyState
            icon="🕒"
            title="No transactions yet"
            body="Load the demo data on the dashboard, or run a simulated send to see it here."
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
    <div className="container page history-page">
      <header className="history-head">
        <div>
          <span className="badge">Activity</span>
          <h1 className="page-title">Transaction history</h1>
          <p className="muted">
            {totals.count} transaction{totals.count === 1 ? '' : 's'} across{' '}
            {totals.uniqueCoins} stablecoin{totals.uniqueCoins === 1 ? '' : 's'}.
          </p>
        </div>
        <Link to="/send" className="btn btn-primary">Send a payment</Link>
      </header>

      <section className="history-stats">
        <div className="card history-stat">
          <div className="muted small">Total sent</div>
          <div className="history-stat-num is-out">{formatUsd(totals.sent)}</div>
        </div>
        <div className="card history-stat">
          <div className="muted small">Total received</div>
          <div className="history-stat-num is-in">{formatUsd(totals.received)}</div>
        </div>
        <div className="card history-stat">
          <div className="muted small">Net flow</div>
          <div className="history-stat-num">
            {formatUsd(totals.received - totals.sent)}
          </div>
        </div>
        <div className="card history-stat">
          <div className="muted small">Transactions</div>
          <div className="history-stat-num">{totals.count}</div>
        </div>
      </section>

      <section className="card history-filters">
        <div className="history-filter-group">
          <span className="muted small">Type</span>
          <div className="history-pillgroup">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`history-pill ${type === opt.id ? 'is-active' : ''}`}
                onClick={() => setType(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="history-filter-group">
          <span className="muted small">Coin</span>
          <select
            className="send-input history-coin-select"
            value={coinFilter}
            onChange={(e) => setCoinFilter(e.target.value)}
          >
            <option value="all">All coins</option>
            {usedCoinIds.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-group history-search">
          <span className="muted small">Search</span>
          <input
            type="text"
            className="send-input"
            placeholder="Address, memo, or reference"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {(type !== 'all' || coinFilter !== 'all' || query) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm history-reset"
            onClick={onReset}
          >
            Reset filters
          </button>
        )}
      </section>

      {(type !== 'all' || coinFilter !== 'all' || query) && (
        <p className="muted small history-filter-summary">
          Showing {filtered.length} of {totals.count}.{' '}
          Sent {formatUsd(filteredTotals.sent)} · received{' '}
          {formatUsd(filteredTotals.received)} in this filter.
        </p>
      )}

      <section className="card history-list-card">
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No transactions match these filters"
            body="Try clearing the search box or switching the type filter back to All."
            action={
              <button className="btn btn-ghost" onClick={onReset}>
                Reset filters
              </button>
            }
          />
        ) : (
          <ul className="history-list">
            {filtered.map((tx) => {
              const coin = getCoin(tx.coin)
              const isOut = tx.type === 'send'
              const counterparty = isOut ? tx.to : tx.from
              const riskLevel = tx.riskCheck?.overall != null
                ? levelFromScore(tx.riskCheck.overall)
                : null
              return (
                <li key={tx.id} className="history-row">
                  <div className="history-row-main">
                    <div
                      className={`history-arrow ${isOut ? 'is-out' : 'is-in'}`}
                      aria-hidden
                    >
                      {isOut ? '↑' : '↓'}
                    </div>
                    <CoinGlyph coin={coin} />
                    <div className="history-row-text">
                      <div className="history-row-title">
                        {isOut ? 'Sent' : 'Received'}{' '}
                        {coin?.symbol || tx.coin.toUpperCase()}
                        {tx.invoiceId && (
                          <span className="history-row-tag">invoice</span>
                        )}
                      </div>
                      <div className="muted small">
                        {isOut ? 'to' : 'from'}{' '}
                        <span className="mono">{formatAddress(counterparty)}</span>
                        {tx.memo ? ` · ${tx.memo}` : ''}
                      </div>
                      <div className="muted small history-row-time" title={formatDate(tx.timestamp)}>
                        {formatRelativeTime(tx.timestamp)} · {tx.id}
                      </div>
                    </div>
                  </div>
                  <div className="history-row-side">
                    <div className={`history-row-amount ${isOut ? 'is-out' : 'is-in'}`}>
                      {isOut ? '-' : '+'}
                      {formatTokenAmount(tx.amount, coin?.symbol)}
                    </div>
                    <div className="muted small">{formatUsd(tx.amount)}</div>
                    {riskLevel && (
                      <RiskBadge
                        level={riskLevel}
                        score={tx.riskCheck.overall}
                        compact
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
