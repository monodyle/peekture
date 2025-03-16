import type { Draft } from 'immer'
import { produce } from 'immer'
import type { LUT } from './lut/types'

type Store = {
  luts: Array<LUT>
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
