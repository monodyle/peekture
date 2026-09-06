import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import session from '../session'
import { clampValue, DEFAULT_EXPOSURE, EXPOSURE_KEYS } from './defaults'
import type { Exposure } from './types'

type ExposureState = {
  exposure: Exposure
  setExposure: (next: Exposure) => void
}

const ExposureState = createContext<ExposureState>({
  exposure: DEFAULT_EXPOSURE,
  setExposure: () => {},
})

type ExposureStateProviderProps = React.PropsWithChildren<{
  initialExposure: Exposure | null
}>

export default function ExposureStateProvider({
  initialExposure,
  children,
}: ExposureStateProviderProps) {
  const [exposure, setExposureState] = useState<Exposure>(
    initialExposure ?? DEFAULT_EXPOSURE,
  )

  const setExposure = useCallback((next: Exposure) => {
    setExposureState(next)
    session.write('exposure', next)
  }, [])

  const value = useMemo(
    () => ({ exposure, setExposure }),
    [exposure, setExposure],
  )

  return (
    <ExposureState.Provider value={value}>{children}</ExposureState.Provider>
  )
}

export function useExposure() {
  const { exposure } = useContext(ExposureState)
  return exposure
}

export function useSetExposure() {
  const { setExposure } = useContext(ExposureState)
  return setExposure
}

export function useAdjustExposure() {
  const { exposure, setExposure } = useContext(ExposureState)
  return useCallback(
    (patch: Partial<Exposure>) => {
      const next = { ...exposure }
      for (const key of EXPOSURE_KEYS) {
        next[key] = clampValue(patch[key] ?? exposure[key])
      }
      setExposure(next)
    },
    [exposure, setExposure],
  )
}

export function useResetExposure() {
  const { setExposure } = useContext(ExposureState)
  return useCallback(() => setExposure(DEFAULT_EXPOSURE), [setExposure])
}
