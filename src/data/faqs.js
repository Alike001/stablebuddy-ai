// Curated knowledge base for the AI assistant. Each entry has a list of
// keywords/phrases the matcher looks for. Keep answers short and friendly —
// they're meant to be spoken aloud by the AI buddy.

export const FAQS = [
  {
    id: 'what-is-stablecoin',
    keywords: ['what is a stablecoin', 'stablecoin definition', 'what are stablecoins', 'define stablecoin'],
    answer:
      'A stablecoin is a crypto token designed to hold a steady price — usually $1. Different stablecoins use different recipes: some hold cash and Treasuries (USDC, PYUSD), some hold crypto (DAI), and some use trading strategies (USDe). The recipe matters: it changes the risk.',
  },
  {
    id: 'usdc-vs-usdt',
    keywords: ['usdc vs usdt', 'usdt vs usdc', 'which is safer usdc usdt', 'difference usdc usdt'],
    answer:
      'USDC is issued by Circle, US-regulated, and publishes monthly attestations from a Big-4 firm. USDT (Tether) has a much larger market cap and the deepest liquidity, but its reserves are less transparent and the issuer is offshore. For payments where transparency matters, USDC is usually the safer pick. For raw liquidity or trading, USDT still wins.',
  },
  {
    id: 'dai-explained',
    keywords: ['what is dai', 'how does dai work', 'dai backing'],
    answer:
      'DAI is issued by MakerDAO. Anyone can mint DAI by locking crypto (like ETH or wstETH) into a smart contract that holds more value than the DAI minted. So DAI is "over-collateralized". Risk shifts from a company\'s balance sheet to smart contracts and the value of the collateral.',
  },
  {
    id: 'depeg',
    keywords: ['what is a depeg', 'depeg meaning', 'why does a stablecoin depeg', 'depegging'],
    answer:
      'A "depeg" is when a stablecoin\'s price drifts away from $1. Causes include reserve trouble (real or rumoured), liquidity drying up, regulatory shocks, or smart-contract failures. Even short depegs matter for payments because the receiver may get less than they expected.',
  },
  {
    id: 'yield-bearing',
    keywords: ['what is a yield-bearing stablecoin', 'yield bearing', 'usde yield', 'how does usde earn yield'],
    answer:
      'A yield-bearing stablecoin pays you to hold it. The yield has to come from somewhere — usually T-bill interest passed through to holders, or trading strategies like delta-neutral basis trades (USDe). Always ask: what produces the yield? If you don\'t understand the source, you\'re taking a risk you can\'t price.',
  },
  {
    id: 'how-to-pay-stablecoin',
    keywords: ['how to pay with a stablecoin', 'send stablecoin', 'how do stablecoin payments work'],
    answer:
      'A stablecoin payment is just a token transfer on a blockchain. You need the receiver\'s address, the right network (e.g., USDC on Base vs. Ethereum), and a small amount of native gas to pay fees. StableBuddy\'s pre-flight check helps you sanity-check the address, amount, and the coin\'s risk before you confirm.',
  },
  {
    id: 'gas-fees',
    keywords: ['what is gas', 'gas fees', 'why do i pay gas', 'transaction fees'],
    answer:
      'Gas is the small fee you pay the network to process your transaction. It\'s paid in the chain\'s native token (ETH on Ethereum, MATIC on Polygon, etc.) — not in the stablecoin. Sending USDC on Ethereum can cost a few dollars; on Base, Solana, or Polygon it\'s usually pennies.',
  },
  {
    id: 'self-custody',
    keywords: ['what is self custody', 'custody', 'custodial vs non-custodial'],
    answer:
      'Custodial = a company holds the keys for you (like an exchange). Self-custody = you hold the keys (a wallet like MetaMask). Self-custody removes counterparty risk but puts the responsibility for backups on you. Lose the seed phrase, lose the funds.',
  },
  {
    id: 'invoice-link',
    keywords: ['how does the invoice link work', 'invoice url', 'how shareable invoice'],
    answer:
      'StableBuddy invoices are encoded into the URL itself, so the receiver can open the link and see the amount, coin, and memo without any backend or signup. Great for small businesses and freelancers — until you need persistence, you don\'t need a server.',
  },
  {
    id: 'risk-score',
    keywords: ['how is the risk score calculated', 'risk score', 'how do you score risk'],
    answer:
      'StableBuddy combines five axes — peg stability, backing type, regulatory clarity, liquidity, and smart-contract risk. Each axis has a transparent rule (e.g., fiat-backed = 95, offshore issuer = 50). Weights are visible in the code at riskRules.js. The UI shows the breakdown so nothing is hidden.',
  },
  {
    id: 'algorithmic',
    keywords: ['algorithmic stablecoin', 'what is algorithmic'],
    answer:
      'Algorithmic stablecoins try to keep their peg using market incentives instead of hard collateral. History has been brutal — UST collapsed in 2022 and wiped out billions. StableBuddy scores them as high-risk by design.',
  },
  {
    id: 'mica',
    keywords: ['mica', 'eu mica', 'european stablecoin regulation'],
    answer:
      'MiCA (Markets in Crypto-Assets) is the EU regulation that came fully into force in 2024. Stablecoins issued for EU users need to be authorised under MiCA, with reserve and disclosure rules. It\'s the most comprehensive stablecoin regime in any major jurisdiction so far.',
  },
]
