import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import session from '../session'
import { createDefaultLUT } from './default'
import type { LUT } from './types'

type LUTState = {
  lut: LUT
  setLUT: (lut: LUT) => void
}

type IntensityState = {
  intensity: number
  setIntensity: (intensity: number) => void
}

const defaultLUT = createDefaultLUT()

const LUTState = createContext<LUTState>({
  lut: defaultLUT,
  setLUT: () => {},
})

const IntensityState = createContext<IntensityState>({
  intensity: 100,
  setIntensity: () => {},
})

type LUTStateProviderProps = React.PropsWithChildren<{
  initialLUT: LUT | null
  initialIntensity: number | null
}>

export default function LUTStateProvider({
  initialLUT,
  initialIntensity,
  children,
}: LUTStateProviderProps) {
  const [lut, setLUTState] = useState<LUT>(initialLUT ?? defaultLUT)
  const [intensity, setIntensityState] = useState(initialIntensity ?? 100)

  const setLUT = useCallback((next: LUT) => {
    setLUTState(next)
    session.write('lutId', next.id)
  }, [])
  const setIntensity = useCallback((next: number) => {
    setIntensityState(next)
    session.write('intensity', next)
  }, [])

  const lutValue = useMemo(() => ({ lut, setLUT }), [lut, setLUT])
  const intensityValue = useMemo(
    () => ({ intensity, setIntensity }),
    [intensity, setIntensity],
  )

  return (
    <LUTState.Provider value={lutValue}>
      <IntensityState.Provider value={intensityValue}>
        {children}
      </IntensityState.Provider>
    </LUTState.Provider>
  )
}

export function useLUT() {
  const { lut } = useContext(LUTState)
  return lut
}

export function useSetLUT() {
  const { setLUT } = useContext(LUTState)
  return setLUT
}

export function useIntensity() {
  const { intensity } = useContext(IntensityState)
  return intensity
}

export function useResetEdits() {
  const { setLUT } = useContext(LUTState)
  const { setIntensity } = useContext(IntensityState)
  return useCallback(() => {
    setLUT(defaultLUT)
    setIntensity(100)
  }, [setLUT, setIntensity])
}

export function useSetIntensity() {
  const { setIntensity } = useContext(IntensityState)
  return setIntensity
}
