import { update, setSettings } from '../utils/storage.js'
import { shortId } from '../utils/format.js'

const SEED_BALANCES = {
  usdc: 1500,
  usdt: 800,
  dai: 320,
  pyusd: 200,
  usde: 150,
}

const SAMPLE_PEERS = {
  alice: '0xAlice00000000000000000000000000000001',
  bob: '0xBob000000000000000000000000000000Bob1',
  cafe: '0xCafe00000000000000000000000000000Cafe',
  freelancer: '0xFree0000000000000000000000000000Free1',
}

function tx(partial) {
  return {
    id: shortId('tx'),
    status: 'completed',
    timestamp: Date.now() - partial.minutesAgo * 60_000,
    ...partial,
  }
}

const SEED_TRANSACTIONS = [
  tx({
    type: 'receive', coin: 'usdc', amount: 250,
    from: SAMPLE_PEERS.alice, to: '0xDEMO00000000000000000000000000000DemoUser',
    memo: 'Web design — March', minutesAgo: 60 * 24 * 3,
  }),
  tx({
    type: 'send', coin: 'dai', amount: 40,
    from: '0xDEMO00000000000000000000000000000DemoUser', to: SAMPLE_PEERS.cafe,
    memo: 'Coffee tab', minutesAgo: 60 * 18,
    riskCheck: { overall: 88, level: 'low' },
  }),
  tx({
    type: 'send', coin: 'usdc', amount: 1200,
    from: '0xDEMO00000000000000000000000000000DemoUser', to: SAMPLE_PEERS.freelancer,
    memo: 'April retainer', minutesAgo: 60 * 6,
    riskCheck: { overall: 82, level: 'low' },
  }),
  tx({
    type: 'receive', coin: 'pyusd', amount: 200,
    from: SAMPLE_PEERS.bob, to: '0xDEMO00000000000000000000000000000DemoUser',
    memo: 'Concert tickets', minutesAgo: 60 * 2,
  }),
]

const SEED_INVOICES = [
  {
    id: shortId('inv'),
    payee: 'StableBuddy Demo',
    payeeAddress: '0xDEMO00000000000000000000000000000DemoUser',
    amount: 450,
    coin: 'usdc',
    memo: 'Hackathon design sprint',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString().slice(0, 10),
    status: 'open',
    createdAt: Date.now() - 60 * 60_000,
  },
]

export function seedDemoData() {
  update((s) => ({
    ...s,
    wallet: { ...s.wallet, balances: { ...SEED_BALANCES } },
    transactions: [...SEED_TRANSACTIONS],
    invoices: [...SEED_INVOICES],
  }))
  setSettings({ seeded: true })
}

export function isEmpty(state) {
  const balanceTotal = Object.values(state.wallet?.balances || {}).reduce(
    (sum, n) => sum + Number(n || 0), 0,
  )
  return (
    balanceTotal === 0 &&
    (!state.transactions || state.transactions.length === 0) &&
    (!state.invoices || state.invoices.length === 0)
  )
}
