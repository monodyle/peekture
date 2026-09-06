import { RANGE } from './presets'
import type { WhiteBalance, WhiteBalanceGains } from './types'

// Strength of a full slider swing on each channel. Temperature moves red and
// blue against each other. Tint moves green against red and blue.
const TEMPERATURE_STRENGTH = 0.3
const TINT_STRENGTH = 0.2

// Rec. 709 luma weights, used to keep overall brightness steady.
const LUMA_R = 0.2126
const LUMA_G = 0.7152
const LUMA_B = 0.0722

function rawGains(temperature: number, tint: number): WhiteBalanceGains {
  const t = temperature / RANGE
  const n = tint / RANGE
  return {
    r: 1 + TEMPERATURE_STRENGTH * t + (TINT_STRENGTH / 2) * n,
    g: 1 - TINT_STRENGTH * n,
    b: 1 - TEMPERATURE_STRENGTH * t + (TINT_STRENGTH / 2) * n,
  }
}

export function whiteBalanceGains({
  temperature,
  tint,
}: Pick<WhiteBalance, 'temperature' | 'tint'>): WhiteBalanceGains {
  const raw = rawGains(temperature, tint)
  const luma = LUMA_R * raw.r + LUMA_G * raw.g + LUMA_B * raw.b
  return { r: raw.r / luma, g: raw.g / luma, b: raw.b / luma }
}

// Inverse of whiteBalanceGains up to the luma normalisation, which the
// slider model cancels out. Used to turn a measured cast into slider values.
export function gainsToWhiteBalance(
  gains: WhiteBalanceGains,
): Pick<WhiteBalance, 'temperature' | 'tint'> {
  const mean = (gains.r + gains.g + gains.b) / 3
  const r = gains.r / mean
  const g = gains.g / mean
  const b = gains.b / mean
  const n = (1 - g) / TINT_STRENGTH
  const t = (r - b) / (2 * TEMPERATURE_STRENGTH)
  return { temperature: t * RANGE, tint: n * RANGE }
}

function clamp255(value: number) {
  return value < 0 ? 0 : value > 255 ? 255 : value
}

export function applyWhiteBalance(
  imageData: ImageData,
  whiteBalance: WhiteBalance,
) {
  if (whiteBalance.temperature === 0 && whiteBalance.tint === 0) {
    return imageData
  }
  const { r, g, b } = whiteBalanceGains(whiteBalance)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp255(data[i] * r)
    data[i + 1] = clamp255(data[i + 1] * g)
    data[i + 2] = clamp255(data[i + 2] * b)
  }
  return imageData
}
