import { nanoid } from 'nanoid'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import session from '../session'

export type Revision = {
  id: string
  prompt: string | null
  source: Blob
  createdAt: number
}

export type RevisionHistory = {
  revisions: Array<Revision>
  activeId: string | null
}

type RevisionState = RevisionHistory & {
  start: (source: Blob) => void
  add: (prompt: string, source: Blob) => void
  select: (id: string) => void
  remove: (id: string) => void
}

const EMPTY_HISTORY: RevisionHistory = { revisions: [], activeId: null }

const RevisionState = createContext<RevisionState>({
  ...EMPTY_HISTORY,
  start: () => {},
  add: () => {},
  select: () => {},
  remove: () => {},
})

function createRevision(prompt: string | null, source: Blob): Revision {
  return { id: nanoid(), prompt, source, createdAt: Date.now() }
}

export function createHistory(source: Blob): RevisionHistory {
  const original = createRevision(null, source)
  return { revisions: [original], activeId: original.id }
}

type RevisionStateProviderProps = React.PropsWithChildren<{
  initialHistory: RevisionHistory | null
}>

export default function RevisionStateProvider({
  initialHistory,
  children,
}: RevisionStateProviderProps) {
  const [history, setHistory] = useState<RevisionHistory>(
    initialHistory ?? EMPTY_HISTORY,
  )
  const { revisions, activeId } = history

  // Writes are split so selecting a revision does not rewrite every blob.
  useEffect(() => {
    if (revisions.length > 0) session.write('revisions', revisions)
  }, [revisions])
  useEffect(() => {
    if (activeId) session.write('revisionId', activeId)
  }, [activeId])

  const start = useCallback((source: Blob) => {
    setHistory(createHistory(source))
  }, [])

  const add = useCallback((prompt: string, source: Blob) => {
    const revision = createRevision(prompt, source)
    setHistory((previous) => {
      const activeIndex = previous.revisions.findIndex(
        (item) => item.id === previous.activeId,
      )
      const kept =
        activeIndex === -1
          ? previous.revisions
          : previous.revisions.slice(0, activeIndex + 1)
      return { revisions: [...kept, revision], activeId: revision.id }
    })
  }, [])

  const select = useCallback((id: string) => {
    setHistory((previous) => ({ ...previous, activeId: id }))
  }, [])

  const remove = useCallback((id: string) => {
    setHistory((previous) => {
      const index = previous.revisions.findIndex((item) => item.id === id)
      if (index <= 0) return previous
      const next = previous.revisions.filter((item) => item.id !== id)
      const nextActiveId =
        previous.activeId === id ? next[index - 1].id : previous.activeId
      return { revisions: next, activeId: nextActiveId }
    })
  }, [])

  const value = useMemo<RevisionState>(
    () => ({ revisions, activeId, start, add, select, remove }),
    [revisions, activeId, start, add, select, remove],
  )

  return (
    <RevisionState.Provider value={value}>{children}</RevisionState.Provider>
  )
}

export function useRevisions() {
  const { revisions, activeId } = useContext(RevisionState)
  return { revisions, activeId }
}

export function useStartRevisions() {
  const { start } = useContext(RevisionState)
  return start
}

export function useAddRevision() {
  const { add } = useContext(RevisionState)
  return add
}

export function useRemoveRevision() {
  const { remove } = useContext(RevisionState)
  return remove
}

export function useSelectRevision() {
  const { select } = useContext(RevisionState)
  return select
}
