export type Transfer = 'sdr' | 'pq' | 'hlg'

const CICP_TRANSFER_PQ = 16
const CICP_TRANSFER_HLG = 18

function readPngTransfer(bytes: Uint8Array): Transfer | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (bytes.length < 8 || view.getUint32(0) !== 0x89504e47) return null
  let offset = 8
  while (offset + 8 <= bytes.length) {
    const size = view.getUint32(offset)
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
    if (type === 'cICP') {
      const transfer = bytes[offset + 9]
      if (transfer === CICP_TRANSFER_PQ) return 'pq'
      if (transfer === CICP_TRANSFER_HLG) return 'hlg'
      return 'sdr'
    }
    if (type === 'IDAT' || type === 'IEND') return 'sdr'
    offset += 12 + size
  }
  return 'sdr'
}

function transferFromIccDescription(profile: Uint8Array): Transfer | null {
  const text = new TextDecoder('latin1').decode(profile)
  if (/\bPQ\b|2084/i.test(text)) return 'pq'
  if (/\bHLG\b|hybrid.?log/i.test(text)) return 'hlg'
  return null
}

function transferFromJpegSegment(
  bytes: Uint8Array,
  offset: number,
  size: number,
): Transfer | null {
  const start = offset + 4
  const header = String.fromCharCode(...bytes.subarray(start, start + 11))
  if (header !== 'ICC_PROFILE') return null
  return transferFromIccDescription(
    bytes.subarray(start + 14, offset + 2 + size),
  )
}

function readJpegTransfer(bytes: Uint8Array): Transfer | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return 'sdr'
    const marker = bytes[offset + 1]
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3]
    if (marker === 0xe2) {
      const found = transferFromJpegSegment(bytes, offset, size)
      if (found) return found
    }
    if (marker === 0xda) return 'sdr'
    offset += 2 + size
  }
  return 'sdr'
}

export function readTransfer(bytes: Uint8Array): Transfer {
  return readPngTransfer(bytes) ?? readJpegTransfer(bytes) ?? 'sdr'
}
