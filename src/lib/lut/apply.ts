import type { LUT } from './types'

type RGB = [number, number, number]
export type LUTData = RGB[][][]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpRGB(c1: RGB, c2: RGB, t: number): RGB {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]
}

function trilinearInterpolation(
  lutData: LUTData,
  size: number,
  xIn: number,
  yIn: number,
  zIn: number,
): RGB {
  // Ensure coordinates are within bounds
  const x = Math.max(0, Math.min(size - 1, xIn))
  const y = Math.max(0, Math.min(size - 1, yIn))
  const z = Math.max(0, Math.min(size - 1, zIn))

  const x1 = Math.floor(x)
  const y1 = Math.floor(y)
  const z1 = Math.floor(z)
  const x2 = Math.min(x1 + 1, size - 1)
  const y2 = Math.min(y1 + 1, size - 1)
  const z2 = Math.min(z1 + 1, size - 1)

  const xf = x - x1
  const yf = y - y1
  const zf = z - z1

  const c000 = lutData[z1][y1][x1]
  const c001 = lutData[z2][y1][x1]
  const c010 = lutData[z1][y2][x1]
  const c011 = lutData[z2][y2][x1]
  const c100 = lutData[z1][y1][x2]
  const c101 = lutData[z2][y1][x2]
  const c110 = lutData[z1][y2][x2]
  const c111 = lutData[z2][y2][x2]

  const c00 = lerpRGB(c000, c001, zf)
  const c01 = lerpRGB(c010, c011, zf)
  const c10 = lerpRGB(c100, c101, zf)
  const c11 = lerpRGB(c110, c111, zf)

  const c0 = lerpRGB(c00, c01, yf)
  const c1 = lerpRGB(c10, c11, yf)

  return lerpRGB(c0, c1, xf)
}

export default function applyLUT(imageData: ImageData, lut: LUT) {
  const data = imageData.data
  const lutString = lut.data

  // Parse .cube file
  const lines = lutString.split('\n')
  let size = 0
  let lutData: LUTData = []
  let domainMin = [0, 0, 0]
  let domainMax = [1, 1, 1]

  // Parse header
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('#')) continue

    if (trimmedLine.startsWith('LUT_3D_SIZE')) {
      size = Number.parseInt(trimmedLine.split(' ')[1], 10)
    } else if (trimmedLine.startsWith('DOMAIN_MIN')) {
      domainMin = trimmedLine
        .split(' ')
        .slice(1)
        .map((v) => Number.parseFloat(v)) as [number, number, number]
    } else if (trimmedLine.startsWith('DOMAIN_MAX')) {
      domainMax = trimmedLine
        .split(' ')
        .slice(1)
        .map((v) => Number.parseFloat(v)) as [number, number, number]
    }
  }

  // Initialize 3D LUT array
  lutData = Array(size)
    .fill(0)
    .map(() =>
      Array(size)
        .fill(0)
        .map(() =>
          Array(size)
            .fill(0)
            .map(() => [0, 0, 0] as RGB),
        ),
    )

  // Parse LUT data
  let dataIndex = 0
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (
      trimmedLine.startsWith('#') ||
      trimmedLine.startsWith('LUT') ||
      trimmedLine.startsWith('DOMAIN') ||
      !trimmedLine
    ) {
      continue
    }

    const values = trimmedLine.split(/\s+/)
    if (values.length === 3 && !Number.isNaN(Number.parseFloat(values[0]))) {
      // Keep values in normalized form [0,1] for better precision
      const r = Number.parseFloat(values[0])
      const g = Number.parseFloat(values[1])
      const b = Number.parseFloat(values[2])

      const z = Math.floor(dataIndex / (size * size))
      const y = Math.floor((dataIndex % (size * size)) / size)
      const x = dataIndex % size

      lutData[z][y][x] = [
        Math.floor(r * 255),
        Math.floor(g * 255),
        Math.floor(b * 255),
      ]
      dataIndex++
    }
  }

  // Apply 3D LUT transformation with trilinear interpolation
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Scale input RGB to LUT coordinates
    const x = (r / 255) * (size - 1)
    const y = (g / 255) * (size - 1)
    const z = (b / 255) * (size - 1)

    // Get transformed color using trilinear interpolation
    const newColor = trilinearInterpolation(lutData, size, x, y, z)

    // Apply the transformed colors with alpha preservation
    data[i] = Math.max(0, Math.min(255, newColor[0]))
    data[i + 1] = Math.max(0, Math.min(255, newColor[1]))
    data[i + 2] = Math.max(0, Math.min(255, newColor[2]))
  }

  return imageData
}
