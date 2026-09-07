import { isIdentity, RANGES } from './defaults'
import type { Adjustments } from './types'

// A full temperature swing moves red and blue against each other by this
// fraction. A full tint swing moves green against red and blue.
const TEMPERATURE_STRENGTH = 0.3
const TINT_STRENGTH = 0.2

// Rec. 709 luma weights.
const LUMA_R = 0.2126
const LUMA_G = 0.7152
const LUMA_B = 0.0722

// Midtone detail is local contrast on a blur radius of one percent of the
// short side. Shadow and highlight move by up to half the range at full swing.
const DETAIL_RADIUS_FRACTION = 0.01
const DETAIL_STRENGTH = 1.5
const TONE_REGION_STRENGTH = 0.5

const TONE_CURVE_SIZE = 1024

// Gamma at full swing raises luma to the power 0.2 (or 5 the other way),
// measured against DaVinci Resolve.
const GAMMA_BASE = 5

type Gains = { r: number; g: number; b: number }

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

function rawGains(temperature: number, tint: number): Gains {
  const t = temperature / RANGES.temperature.max
  const n = tint / RANGES.tint.max
  return {
    r: 1 + TEMPERATURE_STRENGTH * t + (TINT_STRENGTH / 2) * n,
    g: 1 - TINT_STRENGTH * n,
    b: 1 - TEMPERATURE_STRENGTH * t + (TINT_STRENGTH / 2) * n,
  }
}

// Gains are normalised so the overall brightness stays steady.
export function whiteBalanceGains(
  adjustments: Pick<Adjustments, 'temperature' | 'tint'>,
): Gains {
  const raw = rawGains(adjustments.temperature, adjustments.tint)
  const luma = LUMA_R * raw.r + LUMA_G * raw.g + LUMA_B * raw.b
  return { r: raw.r / luma, g: raw.g / luma, b: raw.b / luma }
}

// Inverse of whiteBalanceGains up to the luma normalisation, which the
// slider model cancels out. Turns a measured cast into slider values.
export function gainsToWhiteBalance(
  gains: Gains,
): Pick<Adjustments, 'temperature' | 'tint'> {
  const mean = (gains.r + gains.g + gains.b) / 3
  const r = gains.r / mean
  const g = gains.g / mean
  const b = gains.b / mean
  const n = (1 - g) / TINT_STRENGTH
  const t = (r - b) / (2 * TEMPERATURE_STRENGTH)
  return {
    temperature: t * RANGES.temperature.max,
    tint: n * RANGES.tint.max,
  }
}

// White balance is the only stage before lift, so it is a curve per channel.
function buildBalanceCurves(adjustments: Adjustments) {
  const gains = whiteBalanceGains(adjustments)
  const channelGains = [gains.r, gains.g, gains.b]
  return channelGains.map((gain) => {
    const curve = new Float32Array(256)
    for (let v = 0; v < 256; v++) curve[v] = clamp01((v / 255) * gain)
    return curve
  })
}

// Lift, gamma and gain act on the pixel's luma. The luma runs through this
// curve and the difference is added to all three channels, so colour
// differences stay intact and the result is not a fade.
function buildLumaCurve({ lift, gamma, gain }: Adjustments) {
  const exponent = GAMMA_BASE ** -gamma
  const curve = new Float32Array(TONE_CURVE_SIZE)
  for (let v = 0; v < TONE_CURVE_SIZE; v++) {
    const y = v / (TONE_CURVE_SIZE - 1)
    const lifted = clamp01(y + lift * (1 - y))
    curve[v] = lifted ** exponent * gain
  }
  return curve
}

function applyLumaCurve(pixels: Float32Array, curve: Float32Array) {
  const scale = TONE_CURVE_SIZE - 1
  for (let i = 0; i < pixels.length; i += 3) {
    const y = luma(pixels, i)
    const delta = curve[Math.round(clamp01(y) * scale)] - y
    pixels[i] += delta
    pixels[i + 1] += delta
    pixels[i + 2] += delta
  }
}

// Contrast scales each channel around the pivot.
function applyContrast(pixels: Float32Array, contrast: number, pivot: number) {
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = (pixels[i] - pivot) * contrast + pivot
  }
}

function luma(pixels: Float32Array, i: number) {
  return LUMA_R * pixels[i] + LUMA_G * pixels[i + 1] + LUMA_B * pixels[i + 2]
}

function boxBlur(
  source: Float32Array,
  width: number,
  height: number,
  radius: number,
) {
  const temp = new Float32Array(source.length)
  const output = new Float32Array(source.length)
  const window = radius * 2 + 1

  for (let y = 0; y < height; y++) {
    const row = y * width
    let sum = 0
    for (let x = -radius; x <= radius; x++) {
      sum += source[row + Math.min(width - 1, Math.max(0, x))]
    }
    for (let x = 0; x < width; x++) {
      temp[row + x] = sum / window
      const leaving = Math.max(0, x - radius)
      const entering = Math.min(width - 1, x + radius + 1)
      sum += source[row + entering] - source[row + leaving]
    }
  }

  for (let x = 0; x < width; x++) {
    let sum = 0
    for (let y = -radius; y <= radius; y++) {
      sum += temp[Math.min(height - 1, Math.max(0, y)) * width + x]
    }
    for (let y = 0; y < height; y++) {
      output[y * width + x] = sum / window
      const leaving = Math.max(0, y - radius)
      const entering = Math.min(height - 1, y + radius + 1)
      sum += temp[entering * width + x] - temp[leaving * width + x]
    }
  }
  return output
}

function applyMidtoneDetail(
  pixels: Float32Array,
  width: number,
  height: number,
  amount: number,
) {
  const count = width * height
  const lumas = new Float32Array(count)
  for (let p = 0; p < count; p++) lumas[p] = luma(pixels, p * 3)

  const radius = Math.max(
    1,
    Math.round(Math.min(width, height) * DETAIL_RADIUS_FRACTION),
  )
  const blurred = boxBlur(lumas, width, height, radius)
  const strength = (amount / RANGES.midtoneDetail.max) * DETAIL_STRENGTH

  for (let p = 0; p < count; p++) {
    const l = lumas[p]
    const midtoneWeight = 1 - Math.abs(2 * l - 1)
    const delta = (l - blurred[p]) * strength * midtoneWeight
    const i = p * 3
    pixels[i] += delta
    pixels[i + 1] += delta
    pixels[i + 2] += delta
  }
}

function applyToneRegions(
  pixels: Float32Array,
  shadow: number,
  highlight: number,
) {
  const shadowAmount = (shadow / RANGES.shadow.max) * TONE_REGION_STRENGTH
  const highlightAmount =
    (highlight / RANGES.highlight.max) * TONE_REGION_STRENGTH
  for (let i = 0; i < pixels.length; i += 3) {
    const l = clamp01(luma(pixels, i))
    const delta = shadowAmount * (1 - l) * (1 - l) + highlightAmount * l * l
    pixels[i] += delta
    pixels[i + 1] += delta
    pixels[i + 2] += delta
  }
}

// Saturation scales chroma around the gray axis and hue rotates it, so both
// combine into one matrix (the SVG feColorMatrix formulas).
function buildColorMatrix(saturation: number, hue: number) {
  const s = saturation / RANGES.saturation.default
  const angle = ((hue - RANGES.hue.default) / RANGES.hue.default) * Math.PI
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  const rotate = [
    LUMA_R + cos * (1 - LUMA_R) - sin * LUMA_R,
    LUMA_G - cos * LUMA_G - sin * LUMA_G,
    LUMA_B - cos * LUMA_B + sin * (1 - LUMA_B),
    LUMA_R - cos * LUMA_R + sin * 0.143,
    LUMA_G + cos * (1 - LUMA_G) + sin * 0.14,
    LUMA_B - cos * LUMA_B - sin * 0.283,
    LUMA_R - cos * LUMA_R - sin * (1 - LUMA_R),
    LUMA_G - cos * LUMA_G + sin * LUMA_G,
    LUMA_B + cos * (1 - LUMA_B) + sin * LUMA_B,
  ]
  const saturate = [
    LUMA_R + s * (1 - LUMA_R),
    LUMA_G - s * LUMA_G,
    LUMA_B - s * LUMA_B,
    LUMA_R - s * LUMA_R,
    LUMA_G + s * (1 - LUMA_G),
    LUMA_B - s * LUMA_B,
    LUMA_R - s * LUMA_R,
    LUMA_G - s * LUMA_G,
    LUMA_B + s * (1 - LUMA_B),
  ]

  const matrix = new Float32Array(9)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let sum = 0
      for (let k = 0; k < 3; k++) {
        sum += saturate[row * 3 + k] * rotate[k * 3 + col]
      }
      matrix[row * 3 + col] = sum
    }
  }
  return matrix
}

function applyColorMatrix(pixels: Float32Array, m: Float32Array) {
  for (let i = 0; i < pixels.length; i += 3) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    pixels[i] = m[0] * r + m[1] * g + m[2] * b
    pixels[i + 1] = m[3] * r + m[4] * g + m[5] * b
    pixels[i + 2] = m[6] * r + m[7] * g + m[8] * b
  }
}

export function applyAdjustments(
  imageData: ImageData,
  adjustments: Adjustments,
) {
  if (isIdentity(adjustments)) return imageData

  const { width, height, data } = imageData
  const count = width * height
  const curves = buildBalanceCurves(adjustments)
  const pixels = new Float32Array(count * 3)

  for (let p = 0; p < count; p++) {
    const src = p * 4
    const dst = p * 3
    pixels[dst] = curves[0][data[src]]
    pixels[dst + 1] = curves[1][data[src + 1]]
    pixels[dst + 2] = curves[2][data[src + 2]]
  }

  if (
    adjustments.lift !== RANGES.lift.default ||
    adjustments.gamma !== RANGES.gamma.default ||
    adjustments.gain !== RANGES.gain.default
  ) {
    applyLumaCurve(pixels, buildLumaCurve(adjustments))
  }
  if (adjustments.contrast !== RANGES.contrast.default) {
    applyContrast(pixels, adjustments.contrast, adjustments.pivot)
  }

  if (adjustments.midtoneDetail !== RANGES.midtoneDetail.default) {
    applyMidtoneDetail(pixels, width, height, adjustments.midtoneDetail)
  }
  if (
    adjustments.shadow !== RANGES.shadow.default ||
    adjustments.highlight !== RANGES.highlight.default
  ) {
    applyToneRegions(pixels, adjustments.shadow, adjustments.highlight)
  }
  if (
    adjustments.saturation !== RANGES.saturation.default ||
    adjustments.hue !== RANGES.hue.default
  ) {
    applyColorMatrix(
      pixels,
      buildColorMatrix(adjustments.saturation, adjustments.hue),
    )
  }

  for (let p = 0; p < count; p++) {
    const src = p * 3
    const dst = p * 4
    data[dst] = clamp01(pixels[src]) * 255 + 0.5
    data[dst + 1] = clamp01(pixels[src + 1]) * 255 + 0.5
    data[dst + 2] = clamp01(pixels[src + 2]) * 255 + 0.5
  }
  return imageData
}
