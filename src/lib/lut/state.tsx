import { createContext, useContext, useMemo, useState } from 'react'
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

export default function LUTStateProvider({
  children,
}: React.PropsWithChildren) {
  const [lut, setLUT] = useState<LUT>(defaultLUT)
  const [intensity, setIntensity] = useState(100)

  const lutValue = useMemo(() => ({ lut, setLUT }), [lut])
  const intensityValue = useMemo(
    () => ({ intensity, setIntensity }),
    [intensity],
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

export function useSetIntensity() {
  const { setIntensity } = useContext(IntensityState)
  return setIntensity
}
