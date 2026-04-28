import { useSyncExternalStore } from 'react'
import { getState, subscribe } from './storage.js'

// Subscribe a React component to the store. Pass a selector to scope
// re-renders to only the slice you care about.
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(getState()),
  )
}
