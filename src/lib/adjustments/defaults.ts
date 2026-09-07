import type { AdjustmentKey, AdjustmentRange, Adjustments } from './types'

export const RANGES: Record<AdjustmentKey, AdjustmentRange> = {
  temperature: { label: 'Temp', min: -4000, max: 4000, step: 1, default: 0 },
  tint: { label: 'Tint', min: -100, max: 100, step: 1, default: 0 },
  lift: { label: 'Lift', min: -1, max: 1, step: 0.01, default: 0 },
  gamma: { label: 'Gamma', min: -1, max: 1, step: 0.01, default: 0 },
  gain: { label: 'Gain', min: 0, max: 2, step: 0.001, default: 1 },
  contrast: { label: 'Contrast', min: 0, max: 2, step: 0.001, default: 1 },
  pivot: { label: 'Pivot', min: 0, max: 1, step: 0.001, default: 0.5 },
  midtoneDetail: {
    label: 'Midtone Detail',
    min: -100,
    max: 100,
    step: 0.01,
    default: 0,
  },
  shadow: { label: 'Shadow', min: -100, max: 100, step: 0.01, default: 0 },
  highlight: {
    label: 'Highlight',
    min: -100,
    max: 100,
    step: 0.01,
    default: 0,
  },
  saturation: {
    label: 'Saturation',
    min: 0,
    max: 100,
    step: 0.01,
    default: 50,
  },
  hue: { label: 'Hue', min: 0, max: 100, step: 0.01, default: 50 },
}

export const ADJUSTMENT_KEYS = Object.keys(RANGES) as Array<AdjustmentKey>

export const GROUPS: Array<Array<AdjustmentKey>> = [
  ['temperature', 'tint'],
  ['lift', 'gamma', 'gain'],
  [
    'contrast',
    'pivot',
    'midtoneDetail',
    'shadow',
    'highlight',
    'saturation',
    'hue',
  ],
]

export const DEFAULT_ADJUSTMENTS = Object.fromEntries(
  ADJUSTMENT_KEYS.map((key) => [key, RANGES[key].default]),
) as Adjustments

export function isIdentity(adjustments: Adjustments) {
  return ADJUSTMENT_KEYS.every(
    (key) => adjustments[key] === RANGES[key].default,
  )
}

export function clampValue(key: AdjustmentKey, value: number) {
  const { min, max, step } = RANGES[key]
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  const snapped = Number((Math.round(value / step) * step).toFixed(decimals))
  return Math.max(min, Math.min(max, snapped))
}

export function withDefaults(partial: Partial<Adjustments> | null) {
  return { ...DEFAULT_ADJUSTMENTS, ...partial }
}
