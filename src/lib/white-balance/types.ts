export type WhiteBalanceMode =
  | 'shot'
  | 'custom'
  | 'daylight'
  | 'flash'
  | 'tungsten'
  | 'fluorescent'

export type WhiteBalance = {
  mode: WhiteBalanceMode
  temperature: number
  tint: number
}

export type WhiteBalanceGains = {
  r: number
  g: number
  b: number
}
