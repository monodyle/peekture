import type { LUT } from './types'

export function createDefaultLUT(): LUT {
  // Create a 2x2x2 identity LUT
  let lutString = 'LUT_3D_SIZE 2\n\n'

  // For a 2x2x2 identity LUT, we need all 8 corners of the RGB cube
  // The values are ordered in RGB order for each point
  // Format: R G B
  lutString += '0.0 0.0 0.0\n' // (0,0,0) - Black
  lutString += '1.0 0.0 0.0\n' // (1,0,0) - Red
  lutString += '0.0 1.0 0.0\n' // (0,1,0) - Green
  lutString += '1.0 1.0 0.0\n' // (1,1,0) - Yellow
  lutString += '0.0 0.0 1.0\n' // (0,0,1) - Blue
  lutString += '1.0 0.0 1.0\n' // (1,0,1) - Magenta
  lutString += '0.0 1.0 1.0\n' // (0,1,1) - Cyan
  lutString += '1.0 1.0 1.0\n' // (1,1,1) - White

  return {
    id: 'default',
    name: 'Original',
    data: lutString,
  }
}
