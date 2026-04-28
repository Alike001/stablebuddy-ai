// Tiny pub/sub on top of localStorage. The store survives reloads and notifies
// subscribers so React components re-render when data changes.

const KEY = 'stablebuddy.v1'

const DEFAULT_STATE = {
  wallet: {
    address: '0xDEMO00000000000000000000000000000DemoUser',
    balances: {}, // { coinId: number }
  },
  transactions: [], // newest first
  invoices: [], // newest first
  chat: [], // { id, role: 'user'|'ai', text, ts }
  settings: {
    seeded: false,
    lastPriceFetch: null,
    livePrices: null, // { coinId: number }
  },
}

let state = load()
const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return clone(DEFAULT_STATE)
    const parsed = JSON.parse(raw)
    return { ...clone(DEFAULT_STATE), ...parsed }
  } catch {
    return clone(DEFAULT_STATE)
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // localStorage can be full or disabled — degrade silently.
  }
}

function emit() {
  listeners.forEach((fn) => fn())
}

export function getState() {
  return state
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Generic setter — accepts a function that returns the new state.
export function update(updater) {
  const next = updater(state)
  if (next === state) return
  state = next
  persist()
  emit()
}

// Convenience helpers around the slices.
export function setWallet(walletPatch) {
  update((s) => ({ ...s, wallet: { ...s.wallet, ...walletPatch } }))
}

export function setBalance(coinId, amount) {
  update((s) => ({
    ...s,
    wallet: {
      ...s.wallet,
      balances: { ...s.wallet.balances, [coinId]: Math.max(0, Number(amount) || 0) },
    },
  }))
}

export function addTransaction(tx) {
  update((s) => ({ ...s, transactions: [tx, ...s.transactions].slice(0, 200) }))
}

export function upsertInvoice(invoice) {
  update((s) => {
    const next = s.invoices.filter((i) => i.id !== invoice.id)
    return { ...s, invoices: [invoice, ...next].slice(0, 100) }
  })
}

export function addChatMessage(msg) {
  update((s) => ({ ...s, chat: [...s.chat, msg].slice(-200) }))
}

export function clearChat() {
  update((s) => ({ ...s, chat: [] }))
}

export function setSettings(patch) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

export function resetAll() {
  state = clone(DEFAULT_STATE)
  persist()
  emit()
}
