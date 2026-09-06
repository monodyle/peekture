import type { Exposure, ExposureKey } from './types'

export const RANGE = 100

export const DEFAULT_EXPOSURE: Exposure = {
  exposure: 0,
  contrast: 0,
  brightness: 0,
  saturation: 0,
}

export const EXPOSURE_KEYS: Array<ExposureKey> = [
  'exposure',
  'contrast',
  'brightness',
  'saturation',
]

export function isIdentity(exposure: Exposure) {
  return EXPOSURE_KEYS.every((key) => exposure[key] === 0)
}

export function clampValue(value: number) {
  return Math.max(-RANGE, Math.min(RANGE, Math.round(value)))
}
