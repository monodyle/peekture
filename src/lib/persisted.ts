import type { Draft } from 'immer'
import { produce } from 'immer'
import type { LUT } from './lut/types'

type Store = {
  luts: Array<LUT>
}

const defaultStore: Store = {
  luts: [],
}

const DB_NAME = 'peekture'
const DB_VERSION = 1
const STORE_NAME = 'luts'

class IndexedDBStorage {
  private db: IDBDatabase | null = null
  private state: Store = defaultStore

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.loadState().then(resolve)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  private async loadState(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.state = { luts: request.result }
        resolve()
      }
    })
  }

  read<Selected>(selector: (persisted: Store) => Selected): Selected {
    return selector(this.state)
  }

  write(writer: (draft: Draft<Store>) => void): void {
    if (!this.db) return

    this.state = produce(this.state, writer)

    const transaction = this.db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    store.clear()

    for (const lut of this.state.luts) {
      store.add(lut)
    }
  }
}

const persisted = new IndexedDBStorage()
export default persisted
