import type { LUT } from './types'

export type ParsedLUT = {
  size: number
  table: Float32Array
}

const parsedCache = new Map<string, ParsedLUT>()

export function parseLUT(lut: LUT): ParsedLUT {
  const cached = parsedCache.get(lut.id)
  if (cached) return cached

  const lines = lut.data.split('\n')
  let size = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('LUT_3D_SIZE')) {
      size = Number.parseInt(trimmed.split(/\s+/)[1], 10)
      break
    }
  }

  const table = new Float32Array(size * size * size * 3)
  let index = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (
      !trimmed ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('LUT') ||
      trimmed.startsWith('DOMAIN')
    ) {
      continue
    }
    const values = trimmed.split(/\s+/)
    if (values.length !== 3) continue
    const r = Number.parseFloat(values[0])
    if (Number.isNaN(r)) continue
    table[index++] = r * 255
    table[index++] = Number.parseFloat(values[1]) * 255
    table[index++] = Number.parseFloat(values[2]) * 255
  }

  const parsed = { size, table }
  parsedCache.set(lut.id, parsed)
  return parsed
}

function clamp255(value: number) {
  return value < 0 ? 0 : value > 255 ? 255 : value
}

export function applyParsedLUT(
  imageData: ImageData,
  { size, table }: ParsedLUT,
  intensity = 1,
) {
  const amount = Math.max(0, Math.min(1, intensity))
  if (amount === 0 || size < 2) return imageData

  const data = imageData.data
  const scale = (size - 1) / 255
  const strideY = size * 3
  const strideZ = size * size * 3
  const keep = 1 - amount

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const x = r * scale
    const y = g * scale
    const z = b * scale

    const x1 = x | 0
    const y1 = y | 0
    const z1 = z | 0
    const x2 = x1 + 1 < size ? x1 + 1 : x1
    const y2 = y1 + 1 < size ? y1 + 1 : y1
    const z2 = z1 + 1 < size ? z1 + 1 : z1

    const xf = x - x1
    const yf = y - y1
    const zf = z - z1

    const i000 = z1 * strideZ + y1 * strideY + x1 * 3
    const i001 = z2 * strideZ + y1 * strideY + x1 * 3
    const i010 = z1 * strideZ + y2 * strideY + x1 * 3
    const i011 = z2 * strideZ + y2 * strideY + x1 * 3
    const i100 = z1 * strideZ + y1 * strideY + x2 * 3
    const i101 = z2 * strideZ + y1 * strideY + x2 * 3
    const i110 = z1 * strideZ + y2 * strideY + x2 * 3
    const i111 = z2 * strideZ + y2 * strideY + x2 * 3

    for (let c = 0; c < 3; c++) {
      const c00 = table[i000 + c] + (table[i001 + c] - table[i000 + c]) * zf
      const c01 = table[i010 + c] + (table[i011 + c] - table[i010 + c]) * zf
      const c10 = table[i100 + c] + (table[i101 + c] - table[i100 + c]) * zf
      const c11 = table[i110 + c] + (table[i111 + c] - table[i110 + c]) * zf
      const c0 = c00 + (c01 - c00) * yf
      const c1 = c10 + (c11 - c10) * yf
      const out = c0 + (c1 - c0) * xf
      data[i + c] = clamp255(data[i + c] * keep + out * amount)
    }
  }

  return imageData
}

export default function applyLUT(
  imageData: ImageData,
  lut: LUT,
  intensity = 1,
) {
  return applyParsedLUT(imageData, parseLUT(lut), intensity)
}
