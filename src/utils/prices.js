// Fetch live stablecoin prices from CoinGecko's free API. The store keeps the
// last successful response so the UI degrades gracefully when offline or rate-
// limited — every coin still has a `fallbackPrice` of $1.

import { STABLECOINS } from '../data/stablecoins.js'
import { setSettings, getState } from './storage.js'

const API_URL = 'https://api.coingecko.com/api/v3/simple/price'

// Minimum time between automatic refetches. CoinGecko's free tier rate-limits
// at ~30 requests/minute; we stay well under that.
const MIN_INTERVAL_MS = 60_000
// Auto-refresh threshold — if the cached prices are older than this, it's
// worth refetching on next mount.
const STALE_AFTER_MS = 5 * 60_000

let inFlight = null

function buildUrl() {
  const ids = STABLECOINS.map((c) => c.coingeckoId).filter(Boolean).join(',')
  return `${API_URL}?ids=${encodeURIComponent(ids)}&vs_currencies=usd`
}

export function arePricesStale(lastFetch) {
  if (!lastFetch) return true
  return Date.now() - lastFetch > STALE_AFTER_MS
}

export async function fetchLivePrices({ force = false } = {}) {
  const state = getState()
  const last = state.settings?.lastPriceFetch
  if (!force && last && Date.now() - last < MIN_INTERVAL_MS) {
    return state.settings?.livePrices || null
  }
  if (inFlight) return inFlight

  const url = buildUrl()
  inFlight = (async () => {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
      const data = await res.json()
      const prices = {}
      for (const coin of STABLECOINS) {
        const entry = data[coin.coingeckoId]
        if (entry && Number.isFinite(entry.usd)) {
          prices[coin.id] = entry.usd
        }
      }
      setSettings({
        livePrices: prices,
        lastPriceFetch: Date.now(),
        priceFetchError: null,
      })
      return prices
    } catch (err) {
      setSettings({
        lastPriceFetch: Date.now(),
        priceFetchError: err.message || 'Failed to fetch prices',
      })
      return null
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}
