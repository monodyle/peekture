import codec from '../codec'
import type { LUT } from './types'

type RGB = [number, number, number]
export type LUTData = RGB[][][]

export default function applyLUT(imageData: ImageData, lut: LUT) {
  const data = imageData.data
  const rawLutData = codec.decode(lut.data)
  const lutString = new TextDecoder().decode(rawLutData)

  // Parse .cube file
  const lines = lutString.split('\n')
  let size = 0
  let lutData: LUTData = []

  // Parse header
  for (const line of lines) {
    if (line.startsWith('LUT_3D_SIZE')) {
      size = Number.parseInt(line.split(' ')[1], 10)
      break
    }
  }

  // Initialize 3D LUT array
  lutData = Array(size)
    .fill(0)
    .map(() =>
      Array(size)
        .fill(0)
        .map(() => Array(size).fill([0, 0, 0])),
    )

  // Parse LUT data
  let dataIndex = 0
  for (const line of lines) {
    const values = line.trim().split(/\s+/)
    if (values.length === 3 && !Number.isNaN(Number.parseFloat(values[0]))) {
      const r = Math.floor(Number.parseFloat(values[0]) * 255)
      const g = Math.floor(Number.parseFloat(values[1]) * 255)
      const b = Math.floor(Number.parseFloat(values[2]) * 255)

      const x = Math.floor(dataIndex / (size * size))
      const y = Math.floor((dataIndex % (size * size)) / size)
      const z = dataIndex % size

      lutData[x][y][z] = [r, g, b]
      dataIndex++
    }
  }

  // Apply 3D LUT transformation
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Convert RGB to LUT indices
    const x = Math.floor((r / 255) * (size - 1))
    const y = Math.floor((g / 255) * (size - 1))
    const z = Math.floor((b / 255) * (size - 1))

    // Get transformed color
    const newColor = lutData[x]?.[y]?.[z]
    if (newColor) {
      ;[data[i], data[i + 1], data[i + 2]] = newColor
    }
  }

  return imageData
}
