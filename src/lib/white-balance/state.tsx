import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import session from '../session'
import { clampValue, DEFAULT_WHITE_BALANCE } from './presets'
import type { WhiteBalance } from './types'

type WhiteBalanceState = {
  whiteBalance: WhiteBalance
  setWhiteBalance: (next: WhiteBalance) => void
}

const WhiteBalanceState = createContext<WhiteBalanceState>({
  whiteBalance: DEFAULT_WHITE_BALANCE,
  setWhiteBalance: () => {},
})

type WhiteBalanceStateProviderProps = React.PropsWithChildren<{
  initialWhiteBalance: WhiteBalance | null
}>

export default function WhiteBalanceStateProvider({
  initialWhiteBalance,
  children,
}: WhiteBalanceStateProviderProps) {
  const [whiteBalance, setWhiteBalanceState] = useState<WhiteBalance>(
    initialWhiteBalance ?? DEFAULT_WHITE_BALANCE,
  )

  const setWhiteBalance = useCallback((next: WhiteBalance) => {
    setWhiteBalanceState(next)
    session.write('whiteBalance', next)
  }, [])

  const value = useMemo(
    () => ({ whiteBalance, setWhiteBalance }),
    [whiteBalance, setWhiteBalance],
  )

  return (
    <WhiteBalanceState.Provider value={value}>
      {children}
    </WhiteBalanceState.Provider>
  )
}

export function useWhiteBalance() {
  const { whiteBalance } = useContext(WhiteBalanceState)
  return whiteBalance
}

export function useSetWhiteBalance() {
  const { setWhiteBalance } = useContext(WhiteBalanceState)
  return setWhiteBalance
}

// Any manual slider change leaves the preset and becomes a custom balance.
export function useAdjustWhiteBalance() {
  const { whiteBalance, setWhiteBalance } = useContext(WhiteBalanceState)
  return useCallback(
    (patch: Partial<Pick<WhiteBalance, 'temperature' | 'tint'>>) => {
      setWhiteBalance({
        mode: 'custom',
        temperature: clampValue(patch.temperature ?? whiteBalance.temperature),
        tint: clampValue(patch.tint ?? whiteBalance.tint),
      })
    },
    [whiteBalance, setWhiteBalance],
  )
}

export function useResetWhiteBalance() {
  const { setWhiteBalance } = useContext(WhiteBalanceState)
  return useCallback(
    () => setWhiteBalance(DEFAULT_WHITE_BALANCE),
    [setWhiteBalance],
  )
}
