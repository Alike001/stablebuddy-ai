import {
  BACKING_SCORES,
  REGULATORY_SCORES,
  CONTRACT_SCORES,
  RISK_WEIGHTS,
  RISK_LEVEL_THRESHOLDS,
  PEG_HISTORY_SCORES,
  liquidityScore,
} from '../data/riskRules.js'

// Compute a 0-100 score for a stablecoin, with a per-axis breakdown so the UI
// can show how the score is built.
export function scoreStablecoin(coin) {
  if (!coin) return null

  const backing = BACKING_SCORES[coin.backing] || { score: 50, label: 'Unknown', why: '' }
  const regulatory = REGULATORY_SCORES[coin.regulatory] || { score: 50, label: 'Unknown', why: '' }
  const contract = CONTRACT_SCORES[coin.contractRisk] || { score: 50, label: 'Unknown', why: '' }
  const liquidity = liquidityScore(coin.marketCapApprox || 0)
  const peg = PEG_HISTORY_SCORES[coin.id] || { score: 70, label: 'Limited history' }

  const axes = [
    { key: 'pegStability', label: 'Peg stability', score: peg.score, detail: peg.label, weight: RISK_WEIGHTS.pegStability },
    { key: 'backingType', label: 'Backing type', score: backing.score, detail: backing.label, why: backing.why, weight: RISK_WEIGHTS.backingType },
    { key: 'regulatoryClarity', label: 'Regulatory clarity', score: regulatory.score, detail: regulatory.label, why: regulatory.why, weight: RISK_WEIGHTS.regulatoryClarity },
    { key: 'liquidity', label: 'Liquidity', score: liquidity.score, detail: liquidity.label, weight: RISK_WEIGHTS.liquidity },
    { key: 'smartContractRisk', label: 'Smart-contract risk', score: contract.score, detail: contract.label, why: contract.why, weight: RISK_WEIGHTS.smartContractRisk },
  ]

  const overall = Math.round(
    axes.reduce((sum, a) => sum + a.score * a.weight, 0),
  )

  return {
    overall,
    level: levelFromScore(overall),
    axes,
  }
}

export function levelFromScore(score) {
  for (const t of RISK_LEVEL_THRESHOLDS) {
    if (score >= t.min) return t
  }
  return RISK_LEVEL_THRESHOLDS[RISK_LEVEL_THRESHOLDS.length - 1]
}

// Pre-flight check for a simulated payment. Returns a structured review so the
// UI can render a checklist of things the user should verify.
export function preflightPayment({ coin, amount, recipient, knownAddresses = [] }) {
  const issues = []
  const checklist = []
  const coinReview = scoreStablecoin(coin)
  let score = coinReview ? coinReview.overall : 60

  if (!recipient || recipient.length < 10) {
    issues.push({
      level: 'danger',
      message: 'Recipient address looks invalid.',
    })
    score -= 25
  } else {
    const isKnown = knownAddresses.includes(recipient)
    if (!isKnown) {
      issues.push({
        level: 'warning',
        message: 'This is the first time you are sending to this address.',
      })
      score -= 8
      checklist.push('Confirm the address with the recipient through a second channel.')
    } else {
      checklist.push('Recipient is in your past activity — looks familiar.')
    }
  }

  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    issues.push({ level: 'danger', message: 'Amount is not a valid positive number.' })
    score -= 25
  } else if (numericAmount >= 10_000) {
    issues.push({
      level: 'warning',
      message: 'Large transfer — double-check before confirming.',
    })
    score -= 6
    checklist.push('For large amounts, send a small test transfer first.')
  } else if (numericAmount >= 1_000) {
    checklist.push('Mid-sized transfer — confirm the amount and address one more time.')
  } else {
    checklist.push('Amount looks routine.')
  }

  if (coin) {
    if (coin.yieldBearing) {
      issues.push({
        level: 'info',
        message: `${coin.symbol} earns yield from off-protocol mechanics. Be aware of where the yield comes from.`,
      })
    }
    if (coin.regulatory === 'offshore') {
      issues.push({
        level: 'info',
        message: `${coin.symbol} is issued offshore — redemption rights can be limited.`,
      })
    }
    if (coin.contractRisk === 'complex-synthetic' || coin.contractRisk === 'complex-vault') {
      issues.push({
        level: 'info',
        message: `${coin.symbol} relies on advanced contracts — extra care for big amounts.`,
      })
    }
  } else {
    issues.push({ level: 'danger', message: 'No stablecoin selected.' })
    score -= 30
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  return {
    overall: clamped,
    level: levelFromScore(clamped),
    coinReview,
    issues,
    checklist,
  }
}
