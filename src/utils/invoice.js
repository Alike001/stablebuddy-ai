// URL-safe base64 encoding/decoding for invoice payloads. The shareable
// invoice link looks like: /invoice/pay?d=<base64url>

function toBase64Url(str) {
  const utf8 = unescape(encodeURIComponent(str))
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (str.length % 4)) % 4)
  return decodeURIComponent(escape(atob(padded)))
}

export function encodeInvoice(invoice) {
  return toBase64Url(JSON.stringify(invoice))
}

export function decodeInvoice(token) {
  try {
    const json = fromBase64Url(token)
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function buildInvoiceUrl(invoice) {
  const token = encodeInvoice(invoice)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/invoice/pay?d=${token}`
}
