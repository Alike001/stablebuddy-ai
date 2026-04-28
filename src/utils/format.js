const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const usdFormatterCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
})

export function formatUsd(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return usdFormatter.format(n)
}

export function formatUsdCompact(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return usdFormatterCompact.format(n)
}

export function formatTokenAmount(value, symbol) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${numberFormatter.format(n)}${symbol ? ' ' + symbol : ''}`
}

export function formatAddress(address) {
  if (!address || address.length < 10) return address || ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function formatRelativeTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - Number(ts)
  const sec = Math.round(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day}d ago`
  const date = new Date(Number(ts))
  return date.toLocaleDateString()
}

export function formatDate(ts) {
  if (!ts) return ''
  return new Date(Number(ts)).toLocaleString()
}

export function shortId(prefix = 'id') {
  const r = Math.random().toString(36).slice(2, 9)
  return `${prefix}_${Date.now().toString(36)}${r}`
}
