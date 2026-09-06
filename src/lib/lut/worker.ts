import { applyParsedLUT, parseLUT } from './apply'
import type { LUT } from './types'

export type LUTWorkerRequest =
  | {
      type: 'source'
      pixels: ArrayBuffer
      width: number
      height: number
    }
  | {
      type: 'apply'
      id: number
      lut: LUT
      intensity: number
    }

export type LUTWorkerResponse = {
  id: number
  pixels: ArrayBuffer
  width: number
  height: number
}

const scope = self as unknown as DedicatedWorkerGlobalScope

let source: ImageData | null = null

scope.onmessage = (event: MessageEvent<LUTWorkerRequest>) => {
  const message = event.data

  if (message.type === 'source') {
    source = new ImageData(
      new Uint8ClampedArray(message.pixels),
      message.width,
      message.height,
    )
    return
  }

  if (!source) return

  const output = new ImageData(source.data.slice(), source.width, source.height)
  applyParsedLUT(output, parseLUT(message.lut), message.intensity)

  const response: LUTWorkerResponse = {
    id: message.id,
    pixels: output.data.buffer,
    width: output.width,
    height: output.height,
  }
  scope.postMessage(response, [response.pixels])
}
