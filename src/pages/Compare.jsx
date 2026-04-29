import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { STABLECOINS } from '../data/stablecoins.js'
import { scoreStablecoin } from '../utils/riskEngine.js'
import { formatUsdCompact } from '../utils/format.js'
import RiskBadge from '../components/RiskBadge.jsx'
import CoinGlyph from '../components/CoinGlyph.jsx'

const COLUMNS = [
  { key: 'symbol', label: 'Coin', sortable: true, align: 'left' },
  { key: 'issuer', label: 'Issuer', sortable: true, align: 'left' },
  { key: 'backing', label: 'Backing', sortable: true, align: 'left' },
  { key: 'regulatory', label: 'Regulatory', sortable: true, align: 'left' },
  { key: 'marketCap', label: 'Market cap', sortable: true, align: 'right' },
  { key: 'score', label: 'Risk score', sortable: true, align: 'right' },
]

const BACKING_LABEL = {
  fiat: 'Fiat',
  'fiat-mixed': 'Fiat + mixed',
  'crypto-overcollateralized': 'Crypto over-collat.',
  'fiat-yield-bearing': 'Fiat (yield-bearing)',
  'synthetic-delta-neutral': 'Synthetic',
  algorithmic: 'Algorithmic',
}

const REG_LABEL = {
  'us-regulated': 'US-regulated',
  'eu-regulated': 'EU MiCA',
  registered: 'Registered',
  offshore: 'Offshore',
  unclear: 'Decentralized',
}

function buildRows() {
  return STABLECOINS.map((coin) => {
    const review = scoreStablecoin(coin)
    return {
      coin,
      review,
      symbol: coin.symbol,
      issuer: coin.issuer,
      backing: BACKING_LABEL[coin.backing] || coin.backing,
      regulatory: REG_LABEL[coin.regulatory] || coin.regulatory,
      marketCap: coin.marketCapApprox || 0,
      score: review.overall,
    }
  })
}

function compareRows(a, b, key, dir) {
  const av = a[key]
  const bv = b[key]
  let cmp
  if (typeof av === 'number' && typeof bv === 'number') {
    cmp = av - bv
  } else {
    cmp = String(av).localeCompare(String(bv))
  }
  return dir === 'asc' ? cmp : -cmp
}

export default function Compare() {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState('score')
  const [sortDir, setSortDir] = useState('desc')

  const rows = useMemo(() => {
    const built = buildRows()
    built.sort((a, b) => compareRows(a, b, sortKey, sortDir))
    return built
  }, [sortKey, sortDir])

  const onSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'symbol' || key === 'issuer' || key === 'backing' || key === 'regulatory' ? 'asc' : 'desc')
    }
  }

  const arrow = (key) => {
    if (key !== sortKey) return ''
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="container page compare-page">
      <header className="compare-head">
        <div>
          <span className="badge">Stablecoin atlas</span>
          <h1 className="page-title">Compare stablecoins</h1>
          <p className="muted">
            Eight major stablecoins, scored across five risk axes. Click any row
            for the full breakdown.
          </p>
        </div>
        <Link to="/risk" className="btn btn-ghost">Open risk checker</Link>
      </header>

      <div className="card compare-card">
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={col.align === 'right' ? 'is-right' : ''}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className={`compare-sort ${sortKey === col.key ? 'is-active' : ''}`}
                        onClick={() => onSort(col.key)}
                      >
                        {col.label}
                        <span className="compare-sort-arrow">{arrow(col.key)}</span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.coin.id}
                  className="compare-row"
                  onClick={() => navigate(`/compare/${row.coin.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/compare/${row.coin.id}`)
                  }}
                >
                  <td>
                    <div className="compare-coin">
                      <CoinGlyph coin={row.coin} />
                      <div>
                        <div className="compare-symbol">{row.coin.symbol}</div>
                        <div className="compare-name muted small">{row.coin.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{row.issuer}</td>
                  <td>{row.backing}</td>
                  <td>{row.regulatory}</td>
                  <td className="is-right mono">{formatUsdCompact(row.marketCap)}</td>
                  <td className="is-right">
                    <RiskBadge level={row.review.level} score={row.review.overall} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="muted small compare-foot">
        Risk scores are calculated locally from a transparent rule set in{' '}
        <span className="mono">src/data/riskRules.js</span>. Higher score = lower risk.
      </p>
    </div>
  )
}
