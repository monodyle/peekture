import localforage from 'localforage'
import type { Exposure } from './exposure/types'
import type { WhiteBalance } from './white-balance/types'

type Session = {
  image: Blob
  lutId: string
  intensity: number
  whiteBalance: WhiteBalance
  exposure: Exposure
}

// Kept apart from the main store so the image blob is not rewritten
// every time a small setting changes.
const storage = localforage.createInstance({
  name: 'peekture',
  storeName: 'session_v1',
})

const session = {
  read<Key extends keyof Session>(key: Key) {
    return storage.getItem<Session[Key]>(key)
  },
  write<Key extends keyof Session>(key: Key, value: Session[Key]) {
    return storage.setItem(key, value)
  },
  clear() {
    return storage.clear()
  },
}
export default session
