import { createContext, useContext, useState } from 'react'
import type { LUT } from './types'
import { createDefaultLUT } from './default'

type LUTState = {
  lut: LUT
  setLUT: (lut: LUT) => void
}

const defaultLUT = createDefaultLUT()

const LUTState = createContext<LUTState>({
  lut: defaultLUT,
  setLUT: () => {},
})

export default function LUTStateProvider({
  children,
}: React.PropsWithChildren) {
  const [lut, setLUT] = useState<LUT>(defaultLUT)

  return (
    <LUTState.Provider value={{ lut, setLUT }}>{children}</LUTState.Provider>
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
