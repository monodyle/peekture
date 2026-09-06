import type { Exposure } from './exposure/types'
import { type LoadedImage, loadImage } from './image/load'
import { createDefaultLUT } from './lut/default'
import type { LUT } from './lut/types'
import persisted from './persisted'
import session from './session'
import type { WhiteBalance } from './white-balance/types'

export type RestoredSession = {
  image: LoadedImage | null
  lut: LUT | null
  intensity: number | null
  whiteBalance: WhiteBalance | null
  exposure: Exposure | null
}

async function restoreImage(blob: Blob | null) {
  if (!blob) return null
  try {
    return await loadImage(blob)
  } catch {
    await session.clear()
    return null
  }
}

function findLUT(id: string | null) {
  if (!id) return null
  const defaultLUT = createDefaultLUT()
  if (id === defaultLUT.id) return defaultLUT
  return (
    persisted.read((state) => state.luts.find((lut) => lut.id === id)) ?? null
  )
}

export async function restoreSession(): Promise<RestoredSession> {
  const [blob, lutId, intensity, whiteBalance, exposure] = await Promise.all([
    session.read('image'),
    session.read('lutId'),
    session.read('intensity'),
    session.read('whiteBalance'),
    session.read('exposure'),
  ])
  return {
    image: await restoreImage(blob),
    lut: findLUT(lutId),
    intensity,
    whiteBalance,
    exposure,
  }
}
