import type { Draft } from 'immer'
import { produce } from 'immer'
import type { LUT } from './lut/types'
import localforage from 'localforage'

type Store = {
  luts: Array<LUT>
  geminiApiKey: string
}

const defaultStore: Store = {
  luts: [],
  geminiApiKey: '',
}

const DB_NAME = 'peekture'
const DB_VERSION = 3
const STORE_NAME = 'storage_v3'

const storage = localforage.createInstance({
  name: DB_NAME,
  version: DB_VERSION,
  storeName: STORE_NAME,
})

let _state: Store = defaultStore

const persisted = {
  async init() {
    const stored = await storage.getItem<Store>(STORE_NAME)
    if (!stored) {
      await storage.setItem(STORE_NAME, defaultStore)
    }
    _state = stored || defaultStore
  },
  read<Selected>(selector: (persisted: Store) => Selected): Selected {
    return selector(_state)
  },
  write(writer: (draft: Draft<Store>) => void) {
    _state = produce(_state, writer)
    return storage.setItem(STORE_NAME, _state)
  },
}
export default persisted
