// Circular badge for a stablecoin (e.g., "USDC" pill in the brand color).

export default function CoinGlyph({ coin, size = 'md' }) {
  if (!coin) return null
  return (
    <span
      className={`coin-glyph ${size === 'lg' ? 'lg' : ''}`}
      style={{ background: coin.color || '#0EA5A4' }}
      aria-label={`${coin.symbol} logo`}
      title={coin.name}
    >
      {coin.symbol}
    </span>
  )
}
