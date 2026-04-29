# StableBuddy AI

> Stablecoin payments, explained by an AI buddy.

StableBuddy AI is a DeFi prototype that helps people compare stablecoins, generate shareable invoices, and run a plain-English **AI risk pre-flight check** before every payment. Everything runs locally — no real wallet, no backend, no API keys.

## Why

Stablecoins look the same on the surface — they don't behave the same. A user who treats USDC, USDT, DAI, and USDe as interchangeable is one bad funding-rate event away from losing money. StableBuddy makes the differences obvious and the risks understandable.

## Features

- **Landing page** — pitch, live risk-engine preview, "how it works" walkthrough.
- **Dashboard** — simulated wallet with seedable demo data, total balance, holdings list, donut chart, recent activity, **live CoinGecko prices** with offline fallback.
- **Compare** — sortable table of 8 major stablecoins (USDC, USDT, DAI, PYUSD, USDe, FDUSD, crvUSD, TUSD).
- **Coin detail** — full risk meter (5 axes), 60-day peg-deviation chart, backing details, pros/cons.
- **Send / Pay** — simulated payment flow with **live AI pre-flight risk check** that updates on every keystroke.
- **Invoice generator** — encode the entire invoice into a base64 URL. No backend, no signup. Payer opens the link, sees the pre-flight check, pays in one click.
- **AI Assistant** — rule-based grounded chat with source citations. No external LLM, no API keys. Streaming reply effect.
- **Risk Checker** — inspect any coin's full breakdown, see the rule tables that produce each axis score, and run **what-if** hypotheticals with a hypothetical-coin builder.
- **History** — filterable transaction log with totals, type/coin/search filters, and per-row risk badges.
- **Responsive UI** — clean breakpoints; works on phones and desktops.
- **Accessibility** — keyboard focus rings, `prefers-reduced-motion` honored, ARIA on icon-only buttons.

## Tech stack

- **React 19** + **Vite 8** (JavaScript, no TypeScript)
- **React Router v7** for client-side routing
- **Recharts 3** for donut + peg-deviation charts (lazy-loaded — only ships with chart pages)
- **Plain CSS** with CSS custom properties for theming
- **localStorage** for the simulated wallet, transactions, invoices, and chat history
- **`useSyncExternalStore`** over a tiny pub/sub for global state (no Redux/Zustand)
- **CoinGecko free API** for live prices, with graceful $1.00 fallback when offline

## Quick start

```bash
git clone https://github.com/Alike001/stablebuddy-ai.git
cd stablebuddy-ai
npm install
npm run dev
```

The app runs on [http://localhost:5173](http://localhost:5173).

## Folder structure

```
stablebuddy-ai/
├── public/                    # Static assets served as-is
├── src/
│   ├── components/            # Reusable UI pieces
│   │   ├── CoinGlyph.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Footer.jsx
│   │   ├── HoldingsDonut.jsx
│   │   ├── Navbar.jsx
│   │   ├── PageLoading.jsx
│   │   ├── PegChart.jsx
│   │   ├── PriceStatus.jsx
│   │   ├── RiskBadge.jsx
│   │   └── RiskMeter.jsx
│   ├── data/                  # Curated knowledge (the source of truth)
│   │   ├── demoSeed.js        # Seed wallet + transactions + invoices
│   │   ├── faqs.js            # AI assistant knowledge base
│   │   ├── glossary.js        # Plain-English DeFi terms
│   │   ├── riskRules.js       # Rule tables that drive the risk engine
│   │   └── stablecoins.js     # 8 stablecoins with metadata
│   ├── pages/                 # Route components
│   │   ├── Assistant.jsx
│   │   ├── CoinDetail.jsx
│   │   ├── Compare.jsx
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   ├── Invoice.jsx
│   │   ├── Landing.jsx
│   │   ├── NotFound.jsx
│   │   ├── PayInvoice.jsx
│   │   ├── Risk.jsx
│   │   └── Send.jsx
│   ├── styles/
│   │   ├── theme.css          # CSS variables (colors, spacing, radii)
│   │   ├── global.css         # Resets + container + a11y
│   │   ├── components.css     # Buttons, navbar, cards, badges, etc.
│   │   └── pages.css          # Per-page layouts
│   ├── utils/
│   │   ├── format.js          # USD / token / address / time formatters
│   │   ├── invoice.js         # base64url encode/decode for shareable URLs
│   │   ├── mockAI.js          # Rule-based assistant matcher
│   │   ├── prices.js          # CoinGecko fetch with throttle + fallback
│   │   ├── riskEngine.js      # scoreStablecoin + preflightPayment
│   │   ├── storage.js         # localStorage pub/sub store
│   │   └── useStore.js        # useSyncExternalStore hook
│   ├── App.jsx                # Routes + lazy loading + Suspense
│   └── main.jsx               # React entry, BrowserRouter, CSS imports
├── index.html
├── package.json
├── vercel.json             
└── vite.config.js
```

## How the risk engine works

The engine is intentionally **transparent** — every score is reproducible from rules in `src/data/riskRules.js`. Five axes, each with a fixed weight:

| Axis | Weight |
| --- | --- |
| Peg stability | 25% |
| Backing type | 25% |
| Regulatory clarity | 18% |
| Liquidity | 17% |
| Smart-contract risk | 15% |

The overall score is just a weighted average. `scoreStablecoin(coin)` returns `{ overall, level, axes }`. `preflightPayment({ coin, amount, recipient, knownAddresses })` extends that with payment-specific checks (large amounts, first-time recipients, yield-bearing flag, offshore-issuer flag, complex-contract flag). The `/risk` page is a hands-on inspector — you can see the rule tables and build hypothetical coins to feel how the inputs interact.

## How the AI assistant works

`src/utils/mockAI.js` is a rule-based matcher with priority order:

1. **Compare** — two coin mentions + "vs/compare/versus" → live engine comparison.
2. **FAQ** — keyword overlap against `src/data/faqs.js` (12 curated answers).
3. **Coin profile** — single coin mention → full profile from the engine.
4. **Glossary** — "what is X" or term mention → `src/data/glossary.js`.
5. **Intent** — "how do I send/invoice" → guided how-to with deep links.
6. **Fallback** — polite "try one of these" with re-clickable suggestions.

Every answer carries **grounded sources** as clickable pills. No external LLM, no API key required.

## Privacy & data

Everything is stored in **localStorage** under the key `stablebuddy.v1`. Nothing leaves your browser except the CoinGecko price fetch (a single GET request to a public, unauthenticated endpoint). There is no backend, no analytics, no telemetry. Click **Reset** on the dashboard to wipe all local state.

## Disclaimers

- **No real funds, ever.** The wallet is simulated; transactions are localStorage entries.
- **The risk engine is a rule-based heuristic**, not a financial-advice product. Scores are designed to teach, not to trade on.
- **The AI assistant is rule-based**, grounded in the FAQ and glossary in this repo. It does not call any LLM and cannot reason about novel scenarios.
- **CoinGecko prices** are fetched from the free public endpoint; rate limits apply (we throttle to one call per 60s).

## License

MIT — built for the DeFi hackathon.
