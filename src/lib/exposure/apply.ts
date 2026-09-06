import { isIdentity, RANGE } from './defaults'
import type { Exposure } from './types'

// A full slider swing is two stops of exposure, a quarter of the range in
// brightness offset, a doubling or halving of contrast, and full grayscale
// to double saturation.
const EXPOSURE_STOPS = 2
const BRIGHTNESS_OFFSET = 64
const MID_GRAY = 128

const LUMA_R = 0.2126
const LUMA_G = 0.7152
const LUMA_B = 0.0722

function clamp255(value: number) {
  return value < 0 ? 0 : value > 255 ? 255 : value
}

// Exposure, brightness and contrast are per-channel and independent of the
// neighbouring channels, so they fold into a single lookup table.
function buildToneCurve({ exposure, contrast, brightness }: Exposure) {
  const gain = 2 ** ((exposure / RANGE) * EXPOSURE_STOPS)
  const offset = (brightness / RANGE) * BRIGHTNESS_OFFSET
  const slope = 2 ** (contrast / RANGE)
  const curve = new Uint8ClampedArray(256)
  for (let v = 0; v < 256; v++) {
    const exposed = v * gain + offset
    curve[v] = clamp255((exposed - MID_GRAY) * slope + MID_GRAY)
  }
  return curve
}

export function applyExposure(imageData: ImageData, exposure: Exposure) {
  if (isIdentity(exposure)) return imageData

  const curve = buildToneCurve(exposure)
  const saturation = 1 + exposure.saturation / RANGE
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = curve[data[i]]
    const g = curve[data[i + 1]]
    const b = curve[data[i + 2]]
    if (saturation === 1) {
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      continue
    }
    const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b
    data[i] = clamp255(luma + (r - luma) * saturation)
    data[i + 1] = clamp255(luma + (g - luma) * saturation)
    data[i + 2] = clamp255(luma + (b - luma) * saturation)
  }
  return imageData
}
