export type Adjustments = {
  temperature: number
  tint: number
  lift: number
  gamma: number
  gain: number
  contrast: number
  pivot: number
  midtoneDetail: number
  shadow: number
  highlight: number
  saturation: number
  hue: number
}

export type AdjustmentKey = keyof Adjustments

export type AdjustmentRange = {
  label: string
  min: number
  max: number
  step: number
  default: number
}
