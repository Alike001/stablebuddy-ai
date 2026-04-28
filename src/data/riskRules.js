// The Risk Engine reads these rules to turn a stablecoin's properties into a
// transparent score. Higher = safer.

export const BACKING_SCORES = {
  fiat: {
    score: 95,
    label: 'Fully fiat-backed',
    why: 'Reserves held mostly in cash and short-term US Treasuries.',
  },
  'fiat-mixed': {
    score: 75,
    label: 'Fiat reserves with other assets',
    why: 'Reserves include cash but also less-liquid assets like secured loans.',
  },
  'crypto-overcollateralized': {
    score: 78,
    label: 'Over-collateralized by crypto',
    why: 'Backed by more crypto collateral than the dollar value issued.',
  },
  'fiat-yield-bearing': {
    score: 70,
    label: 'Fiat-backed, yield-bearing',
    why: 'Earns yield by sharing T-bill interest; introduces structural complexity.',
  },
  'synthetic-delta-neutral': {
    score: 55,
    label: 'Synthetic delta-neutral',
    why: 'Stability depends on funding rates and centralized exchange custody.',
  },
  algorithmic: {
    score: 25,
    label: 'Algorithmic',
    why: 'No hard collateral — relies on market incentives, historically fragile.',
  },
}

export const REGULATORY_SCORES = {
  'us-regulated': {
    score: 95,
    label: 'US-regulated issuer',
    why: 'Issuer supervised under US/state frameworks (e.g., NY DFS).',
  },
  'eu-regulated': {
    score: 85,
    label: 'EU MiCA-regulated',
    why: 'Issuer authorised under EU MiCA framework.',
  },
  registered: {
    score: 70,
    label: 'Registered with disclosure',
    why: 'Issuer registered in a credible jurisdiction with regular attestations.',
  },
  offshore: {
    score: 50,
    label: 'Offshore issuer',
    why: 'Issuer based in a jurisdiction with limited regulatory clarity.',
  },
  unclear: {
    score: 60,
    label: 'Decentralized — no single issuer',
    why: 'No single legal entity to regulate; risk shifts to smart contracts.',
  },
}

export const CONTRACT_SCORES = {
  'simple-erc20': {
    score: 92,
    label: 'Simple token contract',
    why: 'Minimal logic; smaller attack surface.',
  },
  'vault-based': {
    score: 78,
    label: 'Collateral-vault contracts',
    why: 'Mature collateral vault system (e.g., Maker) with audited modules.',
  },
  'complex-vault': {
    score: 68,
    label: 'Advanced vault mechanics',
    why: 'Custom liquidation logic increases complexity and audit surface.',
  },
  'complex-synthetic': {
    score: 55,
    label: 'Synthetic / hedged design',
    why: 'Coordinates on- and off-chain components; more moving parts to break.',
  },
}

export function liquidityScore(marketCap) {
  if (marketCap >= 50_000_000_000) return { score: 98, label: 'Top-tier liquidity' }
  if (marketCap >= 10_000_000_000) return { score: 90, label: 'Very deep liquidity' }
  if (marketCap >= 2_000_000_000) return { score: 80, label: 'Deep liquidity' }
  if (marketCap >= 500_000_000) return { score: 65, label: 'Medium liquidity' }
  if (marketCap >= 100_000_000) return { score: 50, label: 'Thin liquidity' }
  return { score: 35, label: 'Very thin liquidity' }
}

// Historical peg behaviour, currently encoded by id. Easy to extend with live
// data later.
export const PEG_HISTORY_SCORES = {
  usdc: { score: 88, label: 'One notable dip (SVB)' },
  usdt: { score: 82, label: 'Generally stable' },
  dai: { score: 86, label: 'Generally stable' },
  pyusd: { score: 90, label: 'Stable since launch' },
  usde: { score: 72, label: 'Stable so far, but newer' },
  fdusd: { score: 70, label: 'One sharp confidence dip' },
  crvusd: { score: 80, label: 'Minor periodic deviations' },
  tusd: { score: 60, label: 'Multiple depeg episodes' },
}

// Weighting decides how the axes combine. Keep it explicit so the demo can
// show "this is exactly how the score is built".
export const RISK_WEIGHTS = {
  pegStability: 0.25,
  backingType: 0.25,
  regulatoryClarity: 0.18,
  liquidity: 0.17,
  smartContractRisk: 0.15,
}

export const RISK_LEVEL_THRESHOLDS = [
  { min: 85, level: 'low', label: 'Low risk', tone: 'success' },
  { min: 70, level: 'moderate', label: 'Moderate risk', tone: 'info' },
  { min: 55, level: 'elevated', label: 'Elevated risk', tone: 'warning' },
  { min: 0, level: 'high', label: 'High risk', tone: 'danger' },
]
