export type Dimensions = { width: number; height: number }

const HEADER_BYTES = 256 * 1024

function readJpegDimensions(bytes: Uint8Array): Dimensions | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 2
  while (offset + 9 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null
    const marker = bytes[offset + 1]
    const size = view.getUint16(offset + 2)
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    if (isStartOfFrame) {
      return {
        height: view.getUint16(offset + 5),
        width: view.getUint16(offset + 7),
      }
    }
    if (marker === 0xda) return null
    offset += 2 + size
  }
  return null
}

function readPngDimensions(bytes: Uint8Array): Dimensions | null {
  if (bytes.length < 24) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (view.getUint32(0) !== 0x89504e47) return null
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

export async function readDimensions(blob: Blob): Promise<Dimensions | null> {
  const bytes = new Uint8Array(await blob.slice(0, HEADER_BYTES).arrayBuffer())
  return readJpegDimensions(bytes) ?? readPngDimensions(bytes)
}
