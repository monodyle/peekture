import type { LUT } from './types'

export function createDefaultLUT(): LUT {
  let lutString = 'LUT_3D_SIZE 2\n\n'

  lutString += '0.0 0.0 0.0\n'  // Black maps to black
  lutString += '1.0 1.0 1.0\n'  // White maps to white
  lutString += '1.0 0.0 0.0\n'  // Red maps to red
  lutString += '0.0 1.0 0.0\n'  // Green maps to green
  lutString += '0.0 0.0 1.0\n'  // Blue maps to blue

  return {
    id: 'default',
    name: 'Original',
    data: lutString,
  }
}
