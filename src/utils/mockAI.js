// A small rule-based "AI" that's grounded in the curated FAQ, glossary, and
// risk engine. No external API calls. The matcher returns the best-scoring
// response with a list of grounded sources so the UI can show citations.

import { FAQS } from '../data/faqs.js'
import { GLOSSARY, GLOSSARY_BY_TERM } from '../data/glossary.js'
import { STABLECOINS, getCoin } from '../data/stablecoins.js'
import { scoreStablecoin } from '../utils/riskEngine.js'

function normalize(text) {
  return (text || '').toLowerCase().trim()
}

function findCoinMentions(text) {
  const norm = ` ${normalize(text)} `
  const hits = []
  for (const coin of STABLECOINS) {
    const sym = coin.symbol.toLowerCase()
    const name = coin.name.toLowerCase()
    if (norm.includes(` ${sym} `) || norm.includes(` ${sym}?`) || norm.includes(` ${sym}.`)) {
      hits.push(coin)
    } else if (norm.includes(name)) {
      hits.push(coin)
    }
  }
  return hits
}

function comparePrompt(text) {
  const norm = normalize(text)
  return /\b(vs|versus|compare|compared|difference|better)\b/.test(norm)
}

function describeCoin(coin) {
  const review = scoreStablecoin(coin)
  const top = review.axes.slice().sort((a, b) => b.score - a.score)[0]
  const bottom = review.axes.slice().sort((a, b) => a.score - b.score)[0]
  return [
    `${coin.name} (${coin.symbol}) is issued by ${coin.issuer}. Backing: ${coin.backingDetail}`,
    `StableBuddy scores it ${review.overall}/100 — ${review.level.label.toLowerCase()}.`,
    `Strongest axis: ${top.label.toLowerCase()} (${top.score}). Weakest: ${bottom.label.toLowerCase()} (${bottom.score}).`,
    coin.pegHistoryNote,
  ].join(' ')
}

function compareCoins(a, b) {
  const ra = scoreStablecoin(a)
  const rb = scoreStablecoin(b)
  const winner = ra.overall === rb.overall
    ? null
    : (ra.overall > rb.overall ? a : b)
  const loser = winner === a ? b : a

  const lines = [
    `${a.symbol} scores ${ra.overall}/100 (${ra.level.label.toLowerCase()}); ${b.symbol} scores ${rb.overall}/100 (${rb.level.label.toLowerCase()}).`,
  ]

  if (winner) {
    lines.push(
      `On StableBuddy's risk axes, ${winner.symbol} edges out ${loser.symbol} — mainly because of ${winner.backing.replace('-', ' ')} backing and ${winner.regulatory.replace('-', ' ')} status.`,
    )
  } else {
    lines.push(`They tie on overall score, but they take different paths to get there.`)
  }

  lines.push(`${a.symbol}: ${a.backingDetail}`)
  lines.push(`${b.symbol}: ${b.backingDetail}`)
  lines.push(`Tip: pick based on the axis that matters most to you — liquidity, regulation, or decentralization.`)
  return lines.join(' ')
}

function scoreFaq(faq, norm) {
  let best = 0
  for (const kw of faq.keywords) {
    const k = kw.toLowerCase()
    if (norm.includes(k)) {
      best = Math.max(best, k.length)
    } else {
      const tokens = k.split(/\s+/).filter(Boolean)
      const matched = tokens.filter((t) => norm.includes(t)).length
      if (matched >= Math.max(2, Math.floor(tokens.length * 0.6))) {
        best = Math.max(best, matched * 2)
      }
    }
  }
  return best
}

function bestFaqMatch(text) {
  const norm = normalize(text)
  let best = null
  let bestScore = 0
  for (const faq of FAQS) {
    const s = scoreFaq(faq, norm)
    if (s > bestScore) {
      bestScore = s
      best = faq
    }
  }
  return bestScore >= 4 ? { faq: best, score: bestScore } : null
}

function glossaryLookup(text) {
  const norm = normalize(text)
  const definePattern = /(?:what is|what's|define|meaning of|explain)\s+(?:a\s+|an\s+|the\s+)?([a-z\- ]{2,40})/i
  const match = text.match(definePattern)
  const candidate = match ? match[1].trim().replace(/\?+$/, '').toLowerCase() : null
  if (candidate && GLOSSARY_BY_TERM[candidate]) {
    return GLOSSARY_BY_TERM[candidate]
  }
  for (const entry of GLOSSARY) {
    const t = entry.term.toLowerCase()
    if (norm.includes(t)) return entry
  }
  return null
}

function intentMatch(text) {
  const norm = normalize(text)
  if (/\b(send|pay|transfer)\b.*\b(how|what|guide)\b/.test(norm) ||
      /\bhow (do|to)\b.*\b(send|pay|transfer)\b/.test(norm)) {
    return {
      text:
        "Open the Send page, pick a stablecoin and amount, paste the recipient's address, and add an optional memo. StableBuddy runs an AI pre-flight check on every change — it scores the coin, flags first-time addresses, and warns about large transfers. When you're happy, click Review and confirm, then Confirm send.",
      sources: [{ kind: 'page', label: 'Send page', href: '/send' }],
    }
  }
  if (/\binvoice\b/.test(norm) && /\b(how|create|make|generate)\b/.test(norm)) {
    return {
      text:
        "Go to the Invoice page, fill in the payee name, amount, coin, and due date, then click Generate invoice link. StableBuddy encodes the entire invoice into a base64 URL — the payer just opens the link. No backend, no signup. They'll see the same AI risk check before paying.",
      sources: [{ kind: 'page', label: 'Invoice page', href: '/invoice' }],
    }
  }
  if (/\b(risk|safe|safer|safest|safety)\b/.test(norm) && /\bhow\b/.test(norm)) {
    return {
      text:
        "StableBuddy combines five axes — peg stability, backing type, regulatory clarity, liquidity, and smart-contract risk — into a 0-100 score. Higher = lower risk. Each axis is computed from a transparent rule set, and you can see the breakdown on any coin's detail page.",
      sources: [{ kind: 'faq', label: 'How is the risk score calculated', id: 'risk-score' }],
    }
  }
  return null
}

function fallback() {
  return {
    text:
      "I'm not sure I have an answer for that one. Try asking about a specific coin (\"is USDe safe?\"), comparing two (\"USDC vs USDT\"), defining a term (\"what is depeg?\"), or how to use StableBuddy (\"how do I create an invoice?\").",
    sources: [],
    suggestions: [
      'What is a stablecoin?',
      'USDC vs USDT',
      'How is the risk score calculated?',
      'How do I create an invoice?',
    ],
  }
}

export const SUGGESTED_PROMPTS = [
  'What is a stablecoin?',
  'USDC vs USDT — which is safer?',
  'Is USDe safe?',
  'What is depeg risk?',
  'How is the risk score calculated?',
  'How do I create an invoice?',
]

// Returns { text, sources?: [], suggestions?: [] }
export function answerQuestion(text) {
  const trimmed = (text || '').trim()
  if (!trimmed) return fallback()

  const coins = findCoinMentions(trimmed)

  if (coins.length >= 2 && comparePrompt(trimmed)) {
    const [a, b] = coins
    return {
      text: compareCoins(a, b),
      sources: [
        { kind: 'coin', label: a.symbol, id: a.id },
        { kind: 'coin', label: b.symbol, id: b.id },
      ],
    }
  }

  const faqHit = bestFaqMatch(trimmed)
  if (faqHit && faqHit.score >= 8) {
    return {
      text: faqHit.faq.answer,
      sources: [{ kind: 'faq', label: faqHit.faq.id, id: faqHit.faq.id }],
    }
  }

  if (coins.length === 1) {
    const coin = coins[0]
    return {
      text: describeCoin(coin),
      sources: [{ kind: 'coin', label: coin.symbol, id: coin.id }],
    }
  }

  if (faqHit) {
    return {
      text: faqHit.faq.answer,
      sources: [{ kind: 'faq', label: faqHit.faq.id, id: faqHit.faq.id }],
    }
  }

  const term = glossaryLookup(trimmed)
  if (term) {
    return {
      text: `${term.term}: ${term.def}`,
      sources: [{ kind: 'glossary', label: term.term }],
    }
  }

  const intent = intentMatch(trimmed)
  if (intent) return intent

  return fallback()
}

// Stream the answer one chunk at a time. Used by the chat UI to fake-stream
// tokens for a nicer experience.
export function* streamChunks(text, chunkSize = 3) {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(0, Math.min(text.length, i + chunkSize))
  }
  yield text
}

// Helper for the chat UI: estimate stream duration in ms.
export function estimateStreamMs(text, charsPerSecond = 90) {
  const ms = (text.length / charsPerSecond) * 1000
  return Math.max(400, Math.min(4500, ms))
}

// Resolve a source to a UI-friendly link descriptor.
export function resolveSource(source) {
  if (!source) return null
  if (source.kind === 'coin') {
    const coin = getCoin(source.id)
    return coin
      ? { label: coin.symbol, href: `/compare/${coin.id}`, hint: 'risk profile' }
      : null
  }
  if (source.kind === 'page') {
    return { label: source.label, href: source.href }
  }
  if (source.kind === 'faq') {
    return { label: 'FAQ', hint: source.id }
  }
  if (source.kind === 'glossary') {
    return { label: 'Glossary', hint: source.label }
  }
  return null
}
