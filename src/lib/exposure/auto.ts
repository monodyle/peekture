import { clampValue, RANGE } from './defaults'
import type { Exposure } from './types'

// Auto aims the average luma at a middle gray and stretches the 2-98
// percentile spread to fill most of the range. Two stops is one full slider
// swing, and a doubling of contrast is one full swing.
const TARGET_MEAN = 118
const TARGET_SPREAD = 220
const LOW_PERCENTILE = 0.02
const HIGH_PERCENTILE = 0.98
const EXPOSURE_STOPS = 2

function bitmapToImageData(bitmap: ImageBitmap): ImageData | null {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(bitmap, 0, 0)
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
}

function percentile(histogram: Uint32Array, total: number, fraction: number) {
  const target = total * fraction
  let seen = 0
  for (let v = 0; v < histogram.length; v++) {
    seen += histogram[v]
    if (seen >= target) return v
  }
  return histogram.length - 1
}

export function estimateExposure(bitmap: ImageBitmap): Exposure | null {
  const imageData = bitmapToImageData(bitmap)
  if (!imageData) return null

  const data = imageData.data
  const histogram = new Uint32Array(256)
  let sum = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.round(
      0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2],
    )
    histogram[luma]++
    sum += luma
    count++
  }
  if (count === 0 || sum === 0) return null

  const mean = sum / count
  const low = percentile(histogram, count, LOW_PERCENTILE)
  const high = percentile(histogram, count, HIGH_PERCENTILE)
  const spread = Math.max(1, high - low)

  const stops = Math.log2(TARGET_MEAN / mean)
  const contrastStops = Math.log2(TARGET_SPREAD / spread)

  return {
    exposure: clampValue((stops / EXPOSURE_STOPS) * RANGE),
    contrast: clampValue(contrastStops * RANGE),
    brightness: 0,
    saturation: 0,
  }
}
