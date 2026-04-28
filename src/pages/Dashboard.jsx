import { Link } from 'react-router-dom'
import { useStore } from '../utils/useStore.js'
import { STABLECOINS, getCoin } from '../data/stablecoins.js'
import { seedDemoData, isEmpty } from '../data/demoSeed.js'
import { resetAll } from '../utils/storage.js'
import {
  formatUsd,
  formatTokenAmount,
  formatAddress,
  formatRelativeTime,
} from '../utils/format.js'
import HoldingsDonut from '../components/HoldingsDonut.jsx'
import CoinGlyph from '../components/CoinGlyph.jsx'
import EmptyState from '../components/EmptyState.jsx'

function priceFor(coin, livePrices) {
  if (!coin) return 0
  if (livePrices && Number.isFinite(livePrices[coin.id])) return livePrices[coin.id]
  return coin.fallbackPrice ?? 1
}

function buildHoldings(balances, livePrices) {
  return STABLECOINS
    .map((coin) => {
      const balance = Number(balances?.[coin.id] || 0)
      const price = priceFor(coin, livePrices)
      const value = balance * price
      return { coin, balance, price, value }
    })
    .filter((row) => row.balance > 0)
    .sort((a, b) => b.value - a.value)
}

export default function Dashboard() {
  const state = useStore()
  const livePrices = state.settings?.livePrices
  const holdings = buildHoldings(state.wallet.balances, livePrices)
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
  const empty = isEmpty(state)
  const recent = state.transactions.slice(0, 5)

  const donutData = holdings.map((h) => ({
    symbol: h.coin.symbol,
    color: h.coin.color,
    value: h.value,
  }))

  return (
    <div className="container page dashboard">
      <header className="dash-head">
        <div>
          <span className="badge">Simulated wallet</span>
          <h1 className="page-title">Welcome back</h1>
          <p className="muted dash-address">
            <span className="mono">{formatAddress(state.wallet.address)}</span>
            <span className="dash-address-note">— demo address</span>
          </p>
        </div>
        <div className="dash-actions">
          {empty ? (
            <button className="btn btn-primary" onClick={seedDemoData}>
              Load demo data
            </button>
          ) : (
            <>
              <Link to="/send" className="btn btn-primary">Send a payment</Link>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  if (confirm('Clear all simulated wallet data?')) resetAll()
                }}
              >
                Reset
              </button>
            </>
          )}
        </div>
      </header>

      {empty ? (
        <div className="card dash-empty">
          <EmptyState
            icon="💼"
            title="Your wallet is empty"
            body="Load demo data to see how StableBuddy works — a sample wallet, a few transactions, and one open invoice. You can reset anytime."
            action={
              <button className="btn btn-primary" onClick={seedDemoData}>
                Load demo data
              </button>
            }
          />
        </div>
      ) : (
        <>
          <section className="dash-grid">
            <div className="card dash-balance">
              <div className="dash-balance-head">
                <div>
                  <div className="muted small">Total balance</div>
                  <div className="dash-balance-value">{formatUsd(totalValue)}</div>
                </div>
                <Link to="/compare" className="btn btn-ghost btn-sm">
                  Compare coins
                </Link>
              </div>
              <ul className="holdings-list">
                {holdings.map(({ coin, balance, value }) => (
                  <li key={coin.id} className="holdings-row">
                    <div className="holdings-coin">
                      <CoinGlyph coin={coin} />
                      <div>
                        <div className="holdings-symbol">{coin.symbol}</div>
                        <div className="holdings-name muted small">{coin.name}</div>
                      </div>
                    </div>
                    <div className="holdings-amounts">
                      <div className="holdings-value">{formatUsd(value)}</div>
                      <div className="holdings-balance muted small">
                        {formatTokenAmount(balance, coin.symbol)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card dash-chart">
              <div className="muted small">Holdings split</div>
              <div className="dash-chart-area">
                <HoldingsDonut data={donutData} />
              </div>
              <ul className="legend">
                {donutData.map((d) => (
                  <li key={d.symbol} className="legend-item">
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span>{d.symbol}</span>
                    <span className="legend-value">{formatUsd(d.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card dash-activity">
            <div className="dash-activity-head">
              <h2 className="dash-activity-title">Recent activity</h2>
              <Link to="/history" className="muted-link">View all →</Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState
                icon="🕒"
                title="No transactions yet"
                body="Send a simulated payment or pay an invoice to see it here."
              />
            ) : (
              <ul className="activity-list">
                {recent.map((tx) => {
                  const coin = getCoin(tx.coin)
                  const isOut = tx.type === 'send'
                  const counterparty = isOut ? tx.to : tx.from
                  return (
                    <li key={tx.id} className="activity-row">
                      <div className="activity-coin">
                        <CoinGlyph coin={coin} />
                        <div>
                          <div className="activity-title">
                            {isOut ? 'Sent' : 'Received'} {coin?.symbol || tx.coin.toUpperCase()}
                          </div>
                          <div className="muted small">
                            {isOut ? 'to' : 'from'} <span className="mono">{formatAddress(counterparty)}</span>
                            {tx.memo ? ` · ${tx.memo}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="activity-amounts">
                        <div className={`activity-amount ${isOut ? 'is-out' : 'is-in'}`}>
                          {isOut ? '-' : '+'}{formatTokenAmount(tx.amount, coin?.symbol)}
                        </div>
                        <div className="muted small">{formatRelativeTime(tx.timestamp)}</div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
