import { useEffect, useState } from 'react'
import { useStore } from '../utils/useStore.js'
import { fetchLivePrices, arePricesStale } from '../utils/prices.js'
import { formatRelativeTime } from '../utils/format.js'

export default function PriceStatus() {
  const settings = useStore((s) => s.settings || {})
  const [busy, setBusy] = useState(false)

  const lastFetch = settings.lastPriceFetch
  const error = settings.priceFetchError
  const hasPrices = !!settings.livePrices && Object.keys(settings.livePrices).length > 0

  useEffect(() => {
    if (arePricesStale(lastFetch)) {
      setBusy(true)
      fetchLivePrices().finally(() => setBusy(false))
    }
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onRefresh = async () => {
    setBusy(true)
    await fetchLivePrices({ force: true })
    setBusy(false)
  }

  let statusText
  if (busy) {
    statusText = 'Fetching live prices…'
  } else if (error && !hasPrices) {
    statusText = "Couldn't reach CoinGecko — using $1 fallback"
  } else if (hasPrices && lastFetch) {
    statusText = `Live prices · updated ${formatRelativeTime(lastFetch)}`
  } else if (error && hasPrices) {
    statusText = `Live prices (last fetch failed · ${formatRelativeTime(lastFetch)})`
  } else {
    statusText = 'Using $1 fallback prices'
  }

  return (
    <div className="price-status">
      <span
        className={`price-status-dot ${
          busy ? 'is-busy' : error && !hasPrices ? 'is-error' : hasPrices ? 'is-live' : 'is-fallback'
        }`}
        aria-hidden
      />
      <span className="price-status-text muted small">{statusText}</span>
      <button
        type="button"
        className="price-status-refresh"
        onClick={onRefresh}
        disabled={busy}
        aria-label="Refresh prices"
      >
        ↻
      </button>
    </div>
  )
}
