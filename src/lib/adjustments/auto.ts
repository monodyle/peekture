import { gainsToWhiteBalance } from './apply'
import { clampValue } from './defaults'
import type { Adjustments } from './types'

// Pixels near black or white carry little colour information and skew the
// average, so they are left out.
const MIN_LUMA = 16
const MAX_LUMA = 240

function bitmapToImageData(bitmap: ImageBitmap): ImageData | null {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(bitmap, 0, 0)
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
}

// Gray world: assume the scene averages to neutral gray and pick gains that
// make the mean of each channel equal.
export function estimateWhiteBalance(
  bitmap: ImageBitmap,
): Pick<Adjustments, 'temperature' | 'tint'> | null {
  const imageData = bitmapToImageData(bitmap)
  if (!imageData) return null

  const data = imageData.data
  let sumR = 0
  let sumG = 0
  let sumB = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    if (luma < MIN_LUMA || luma > MAX_LUMA) continue
    sumR += r
    sumG += g
    sumB += b
    count++
  }
  if (count === 0 || sumR === 0 || sumG === 0 || sumB === 0) return null

  const mean = (sumR + sumG + sumB) / 3
  const { temperature, tint } = gainsToWhiteBalance({
    r: mean / sumR,
    g: mean / sumG,
    b: mean / sumB,
  })
  return {
    temperature: clampValue('temperature', temperature),
    tint: clampValue('tint', tint),
  }
}
