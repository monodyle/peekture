import type { LUT } from './types'

type RGB = [number, number, number]
type Transform = (rgb: RGB) => RGB

const SIZE = 17

const clamp = (v: number) => Math.min(1, Math.max(0, v))

function buildCube(name: string, transform: Transform) {
  const lines = [`TITLE "${name}"`, `LUT_3D_SIZE ${SIZE}`, '']
  for (let b = 0; b < SIZE; b++) {
    for (let g = 0; g < SIZE; g++) {
      for (let r = 0; r < SIZE; r++) {
        const out = transform([r / (SIZE - 1), g / (SIZE - 1), b / (SIZE - 1)])
        lines.push(out.map((v) => clamp(v).toFixed(6)).join(' '))
      }
    }
  }
  return lines.join('\n')
}

const luminance = ([r, g, b]: RGB) => 0.2126 * r + 0.7152 * g + 0.0722 * b

const warm: Transform = ([r, g, b]) => [r * 1.08 + 0.02, g * 1.02, b * 0.9]

const cool: Transform = ([r, g, b]) => [r * 0.92, g * 1.0, b * 1.1 + 0.02]

const faded: Transform = ([r, g, b]) => {
  const lift = 0.08
  const gain = 0.92
  return [lift + r * gain, lift + g * gain, lift + b * gain]
}

const mono: Transform = (rgb) => {
  const y = luminance(rgb)
  return [y, y, y]
}

const contrast: Transform = ([r, g, b]) => {
  const curve = (v: number) => 0.5 + (v - 0.5) * 1.25
  return [curve(r), curve(g), curve(b)]
}

const examples: Array<[string, Transform]> = [
  ['Warm', warm],
  ['Cool', cool],
  ['Faded', faded],
  ['Mono', mono],
  ['Punch', contrast],
]

export function createExampleLUTs(): Array<LUT> {
  return examples.map(([name, transform]) => ({
    id: `example-${name.toLowerCase()}`,
    name,
    data: buildCube(name, transform),
  }))
}
