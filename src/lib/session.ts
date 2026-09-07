import localforage from 'localforage'
import type { Adjustments } from './adjustments/types'
import type { Revision } from './image/revision-state'

type Session = {
  image: Blob
  revisions: Array<Revision>
  revisionId: string
  lutId: string
  intensity: number
  adjustments: Adjustments
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
