// Plain-English DeFi glossary used by the assistant and elsewhere in the UI.

export const GLOSSARY = [
  { term: 'Peg', def: 'The price a stablecoin tries to maintain — usually $1.' },
  { term: 'Depeg', def: 'When a stablecoin\'s price drifts away from its peg.' },
  { term: 'Custodial', def: 'A third party (often an exchange) holds your keys.' },
  { term: 'Self-custody', def: 'You hold the keys yourself in a wallet.' },
  { term: 'Collateral', def: 'Assets locked to back a stablecoin or a loan.' },
  { term: 'Over-collateralized', def: 'Locked collateral is worth more than the stablecoin issued.' },
  { term: 'Algorithmic stablecoin', def: 'Tries to keep its peg via incentives instead of hard collateral. Historically risky.' },
  { term: 'Yield-bearing stablecoin', def: 'A stablecoin that pays interest to holders. Always ask where the yield comes from.' },
  { term: 'Attestation', def: 'A periodic statement (often by an accounting firm) that a stablecoin\'s reserves match its supply.' },
  { term: 'Audit', def: 'A deeper, more formal review than an attestation.' },
  { term: 'Gas', def: 'The fee paid to a blockchain to process your transaction.' },
  { term: 'Bridge', def: 'A protocol that moves tokens between chains. A common attack target.' },
  { term: 'MiCA', def: 'The EU regulation governing crypto-asset issuers and stablecoins.' },
  { term: 'NY DFS', def: 'New York Department of Financial Services — a key US regulator for stablecoin issuers.' },
  { term: 'Delta-neutral', def: 'A trading strategy that aims to be unaffected by price moves. USDe uses this.' },
  { term: 'Liquidation', def: 'When a borrower\'s collateral is sold off because it dropped below a threshold.' },
  { term: 'Smart contract risk', def: 'The risk that the code itself has bugs or can be exploited.' },
]

export const GLOSSARY_BY_TERM = Object.fromEntries(
  GLOSSARY.map((g) => [g.term.toLowerCase(), g]),
)
