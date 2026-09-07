import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import session from '../session'
import {
  ADJUSTMENT_KEYS,
  clampValue,
  DEFAULT_ADJUSTMENTS,
  withDefaults,
} from './defaults'
import type { Adjustments } from './types'

type AdjustmentsState = {
  adjustments: Adjustments
  setAdjustments: (next: Adjustments) => void
}

const AdjustmentsState = createContext<AdjustmentsState>({
  adjustments: DEFAULT_ADJUSTMENTS,
  setAdjustments: () => {},
})

type AdjustmentsStateProviderProps = React.PropsWithChildren<{
  initialAdjustments: Partial<Adjustments> | null
}>

export default function AdjustmentsStateProvider({
  initialAdjustments,
  children,
}: AdjustmentsStateProviderProps) {
  const [adjustments, setAdjustmentsState] = useState<Adjustments>(() =>
    withDefaults(initialAdjustments),
  )

  const setAdjustments = useCallback((next: Adjustments) => {
    setAdjustmentsState(next)
    session.write('adjustments', next)
  }, [])

  const value = useMemo(
    () => ({ adjustments, setAdjustments }),
    [adjustments, setAdjustments],
  )

  return (
    <AdjustmentsState.Provider value={value}>
      {children}
    </AdjustmentsState.Provider>
  )
}

export function useAdjustments() {
  const { adjustments } = useContext(AdjustmentsState)
  return adjustments
}

export function useAdjust() {
  const { adjustments, setAdjustments } = useContext(AdjustmentsState)
  return useCallback(
    (patch: Partial<Adjustments>) => {
      const next = { ...adjustments }
      for (const key of ADJUSTMENT_KEYS) {
        next[key] = clampValue(key, patch[key] ?? adjustments[key])
      }
      setAdjustments(next)
    },
    [adjustments, setAdjustments],
  )
}

export function useResetAdjustments() {
  const { setAdjustments } = useContext(AdjustmentsState)
  return useCallback(
    () => setAdjustments(DEFAULT_ADJUSTMENTS),
    [setAdjustments],
  )
}
