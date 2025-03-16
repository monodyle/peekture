import type { Draft } from 'immer'
import { produce } from 'immer'

type Store = {
  luts: Array<string>
}

const defaultStore: Store = {
  luts: [],
}

const key = 'peekture' as const
let _state: Store = defaultStore

const persisted = {
  init() {
    const value = localStorage.getItem(key)
    if (!value) return defaultStore
    _state = JSON.parse(value) || defaultStore
  },
  read<Selected>(selector: (persisted: Store) => Selected): Selected {
    return selector(_state)
  },
  write(writer: (draft: Draft<Store>) => void) {
    _state = produce(_state, writer)
    localStorage.setItem(key, JSON.stringify(_state))
  },
}

export default persisted
