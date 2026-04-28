// Curated metadata for the major stablecoins StableBuddy AI compares.
// Scores are inputs to the risk engine; the engine combines them into a
// transparent overall score.

export const STABLECOINS = [
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    issuer: 'Circle',
    color: '#2775CA',
    backing: 'fiat',
    backingDetail: '100% cash + short-dated US Treasuries; monthly attestations.',
    regulatory: 'us-regulated',
    contractRisk: 'simple-erc20',
    yieldBearing: false,
    chains: ['Ethereum', 'Solana', 'Base', 'Polygon', 'Arbitrum'],
    decimals: 6,
    coingeckoId: 'usd-coin',
    fallbackPrice: 1.0,
    marketCapApprox: 60_000_000_000,
    pegHistoryNote:
      'Held peg tightly except a brief SVB-related dip on 2023-03-11 that recovered within days.',
    pros: [
      'Highly transparent reserves',
      'US-regulated issuer (NY DFS)',
      'Deep liquidity across major chains',
    ],
    cons: [
      'Centralized — issuer can freeze addresses',
      'Briefly depegged during the SVB banking incident',
    ],
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    issuer: 'Tether Ltd.',
    color: '#26A17B',
    backing: 'fiat-mixed',
    backingDetail:
      'Reserves include cash, US Treasuries, secured loans, and other assets. Quarterly attestations rather than full audits.',
    regulatory: 'offshore',
    contractRisk: 'simple-erc20',
    yieldBearing: false,
    chains: ['Tron', 'Ethereum', 'Solana', 'Polygon', 'Arbitrum'],
    decimals: 6,
    coingeckoId: 'tether',
    fallbackPrice: 1.0,
    marketCapApprox: 130_000_000_000,
    pegHistoryNote:
      'Generally tracks $1, with occasional small dips during market stress.',
    pros: [
      'Largest stablecoin by market cap',
      'Deepest cross-exchange liquidity',
      'Cheap on Tron',
    ],
    cons: [
      'Reserve transparency is weaker than peers',
      'Issuer based offshore (BVI), limited regulatory clarity',
    ],
  },
  {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai',
    issuer: 'MakerDAO',
    color: '#F4B731',
    backing: 'crypto-overcollateralized',
    backingDetail:
      'Backed by a mix of crypto collateral (ETH, wstETH, etc.) and real-world assets via MakerDAO vaults; over-collateralized.',
    regulatory: 'unclear',
    contractRisk: 'vault-based',
    yieldBearing: false,
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'],
    decimals: 18,
    coingeckoId: 'dai',
    fallbackPrice: 1.0,
    marketCapApprox: 5_000_000_000,
    pegHistoryNote:
      'Generally at peg; brief deviations during ETH flash crashes (e.g., March 2020).',
    pros: [
      'Decentralized issuance',
      'Transparent on-chain collateral',
      'No single issuer to freeze your funds',
    ],
    cons: [
      'Smart-contract risk via Maker vaults',
      'Indirect exposure to USDC (some collateral is USDC)',
    ],
  },
  {
    id: 'pyusd',
    symbol: 'PYUSD',
    name: 'PayPal USD',
    issuer: 'PayPal / Paxos',
    color: '#0070BA',
    backing: 'fiat',
    backingDetail:
      'Issued by Paxos Trust under NY DFS supervision; reserves are cash + short-term Treasuries.',
    regulatory: 'us-regulated',
    contractRisk: 'simple-erc20',
    yieldBearing: false,
    chains: ['Ethereum', 'Solana'],
    decimals: 6,
    coingeckoId: 'paypal-usd',
    fallbackPrice: 1.0,
    marketCapApprox: 800_000_000,
    pegHistoryNote: 'Stable peg since launch; smaller market means thinner liquidity.',
    pros: [
      'Backed by a regulated US trust',
      'Strong consumer brand (PayPal/Venmo integration)',
      'Clear redemption path through PayPal',
    ],
    cons: [
      'Smaller market cap → thinner DEX liquidity',
      'Centralized; freezable by issuer',
    ],
  },
  {
    id: 'usde',
    symbol: 'USDe',
    name: 'Ethena USDe',
    issuer: 'Ethena Labs',
    color: '#1F1F1F',
    backing: 'synthetic-delta-neutral',
    backingDetail:
      'Synthetic dollar backed by staked ETH/BTC plus short perp positions to hedge price exposure (delta-neutral). Funding-rate driven yield.',
    regulatory: 'offshore',
    contractRisk: 'complex-synthetic',
    yieldBearing: true,
    chains: ['Ethereum', 'Arbitrum'],
    decimals: 18,
    coingeckoId: 'ethena-usde',
    fallbackPrice: 1.0,
    marketCapApprox: 5_000_000_000,
    pegHistoryNote:
      'Generally near peg, but the design depends on positive funding rates and exchange custody.',
    pros: [
      'Generates yield without traditional banking',
      'Crypto-native, transparent on-chain backing',
    ],
    cons: [
      'Funding-rate risk: extended negative funding stresses backing',
      'CEX custody risk (collateral held off-chain)',
      'Smart-contract complexity is high',
    ],
  },
  {
    id: 'fdusd',
    symbol: 'FDUSD',
    name: 'First Digital USD',
    issuer: 'First Digital Labs (Hong Kong)',
    color: '#F2A900',
    backing: 'fiat',
    backingDetail:
      'Reserves held with regulated custodians; monthly attestations.',
    regulatory: 'registered',
    contractRisk: 'simple-erc20',
    yieldBearing: false,
    chains: ['Ethereum', 'BNB Chain', 'Sui'],
    decimals: 18,
    coingeckoId: 'first-digital-usd',
    fallbackPrice: 1.0,
    marketCapApprox: 1_500_000_000,
    pegHistoryNote: 'Generally at peg; brief sharp dip in 2024 on rumours, recovered.',
    pros: [
      'Listed across major CEXs',
      'Common BNB-Chain trading pair',
    ],
    cons: [
      'Issuer is newer, regulatory framework less mature',
      'Has had a confidence-driven depeg episode',
    ],
  },
  {
    id: 'crvusd',
    symbol: 'crvUSD',
    name: 'Curve USD',
    issuer: 'Curve Finance',
    color: '#A41E22',
    backing: 'crypto-overcollateralized',
    backingDetail:
      'Issued against crypto collateral via Curve\'s LLAMMA mechanism, which gradually liquidates rather than triggering full liquidations.',
    regulatory: 'unclear',
    contractRisk: 'complex-vault',
    yieldBearing: false,
    chains: ['Ethereum'],
    decimals: 18,
    coingeckoId: 'crvusd',
    fallbackPrice: 1.0,
    marketCapApprox: 100_000_000,
    pegHistoryNote: 'Generally at peg with periodic small deviations during ETH volatility.',
    pros: [
      'Decentralized issuance',
      'Innovative soft-liquidation design',
    ],
    cons: [
      'Complex contract surface',
      'Smaller liquidity vs majors',
    ],
  },
  {
    id: 'tusd',
    symbol: 'TUSD',
    name: 'TrueUSD',
    issuer: 'Techteryx',
    color: '#1F69FF',
    backing: 'fiat',
    backingDetail:
      'Cash and equivalents held with multiple custodians, real-time attestations published.',
    regulatory: 'offshore',
    contractRisk: 'simple-erc20',
    yieldBearing: false,
    chains: ['Ethereum', 'Tron', 'BNB Chain'],
    decimals: 18,
    coingeckoId: 'true-usd',
    fallbackPrice: 1.0,
    marketCapApprox: 500_000_000,
    pegHistoryNote: 'Has experienced multiple notable depeg events under stress.',
    pros: [
      'Real-time reserve attestations',
      'Wide CEX availability',
    ],
    cons: [
      'History of confidence-driven depegs',
      'Issuer changes have shaken trust',
    ],
  },
]

export const STABLECOINS_BY_ID = Object.fromEntries(
  STABLECOINS.map((c) => [c.id, c]),
)

export function getCoin(id) {
  return STABLECOINS_BY_ID[id] || null
}
