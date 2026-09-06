import type { WhiteBalance, WhiteBalanceMode } from './types'

export const RANGE = 100

type Preset = {
  label: string
  description: string
  temperature: number
  tint: number
}

// The source image is already white balanced by the camera, so "Shot" is
// identity and each preset is a shift relative to it. A preset describes the
// light the scene was taken under: tungsten light is warm, so the preset
// cools the image.
export const PRESETS: Record<Exclude<WhiteBalanceMode, 'custom'>, Preset> = {
  shot: {
    label: 'As Shot',
    description: 'White balance recorded by the camera at capture.',
    temperature: 0,
    tint: 0,
  },
  daylight: {
    label: 'Daylight',
    description: 'Direct sunlight or bright outdoor light.',
    temperature: 10,
    tint: 0,
  },
  flash: {
    label: 'Flash',
    description: 'Studio strobes or camera flash.',
    temperature: 15,
    tint: 0,
  },
  tungsten: {
    label: 'Tungsten',
    description: 'Removes the warm orange cast of incandescent bulbs.',
    temperature: -45,
    tint: 0,
  },
  fluorescent: {
    label: 'Fluorescent',
    description: 'Removes the green or cool magenta cast of fluorescent tubes.',
    temperature: -15,
    tint: 25,
  },
}

export const PRESET_MODES = Object.keys(PRESETS) as Array<keyof typeof PRESETS>

export const DEFAULT_WHITE_BALANCE: WhiteBalance = {
  mode: 'shot',
  temperature: 0,
  tint: 0,
}

export function isPresetMode(
  mode: WhiteBalanceMode,
): mode is keyof typeof PRESETS {
  return mode in PRESETS
}

export function presetWhiteBalance(mode: keyof typeof PRESETS): WhiteBalance {
  const { temperature, tint } = PRESETS[mode]
  return { mode, temperature, tint }
}

export function isIdentity({ temperature, tint }: WhiteBalance) {
  return temperature === 0 && tint === 0
}

export function clampValue(value: number) {
  return Math.max(-RANGE, Math.min(RANGE, Math.round(value)))
}
