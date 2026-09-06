export type Exif = {
  iso: string | null
  shutter: string | null
  aperture: string | null
}

const TAG_EXIF_IFD = 0x8769
const TAG_EXPOSURE_TIME = 0x829a
const TAG_F_NUMBER = 0x829d
const TAG_ISO = 0x8827

const TYPE_SIZE: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
}

function decodeDataUrl(dataUrl: string): Uint8Array | null {
  const comma = dataUrl.indexOf(',')
  if (comma < 0) return null
  const header = dataUrl.slice(0, comma)
  const body = dataUrl.slice(comma + 1)
  if (!header.includes(';base64')) return null
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function findTiffInJpeg(bytes: Uint8Array): Uint8Array | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null
    const marker = bytes[offset + 1]
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3]
    if (marker === 0xe1) {
      const start = offset + 4
      const isExif =
        bytes[start] === 0x45 &&
        bytes[start + 1] === 0x78 &&
        bytes[start + 2] === 0x69 &&
        bytes[start + 3] === 0x66
      if (isExif) return bytes.subarray(start + 6, offset + 2 + size)
    }
    if (marker === 0xda) return null
    offset += 2 + size
  }
  return null
}

function findTiffInPng(bytes: Uint8Array): Uint8Array | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (view.getUint32(0) !== 0x89504e47) return null
  let offset = 8
  while (offset + 8 <= bytes.length) {
    const size = view.getUint32(offset)
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
    if (type === 'eXIf') return bytes.subarray(offset + 8, offset + 8 + size)
    if (type === 'IEND') return null
    offset += 12 + size
  }
  return null
}

function readRational(view: DataView, offset: number, little: boolean) {
  const num = view.getUint32(offset, little)
  const den = view.getUint32(offset + 4, little)
  return den === 0 ? 0 : num / den
}

function formatShutter(seconds: number): string {
  if (seconds <= 0) return ''
  if (seconds >= 1) return `${Number(seconds.toFixed(1))} s`
  return `1/${Math.round(1 / seconds)} s`
}

type Entry = {
  tag: number
  type: number
  valueOffset: number
}

type Reader = {
  view: DataView
  little: boolean
  length: number
}

function readEntries(reader: Reader, ifdOffset: number): Array<Entry> {
  const { view, little, length } = reader
  if (ifdOffset + 2 > length) return []
  const count = view.getUint16(ifdOffset, little)
  const entries: Array<Entry> = []
  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * 12
    if (entry + 12 > length) break
    const type = view.getUint16(entry + 2, little)
    const size = (TYPE_SIZE[type] ?? 1) * view.getUint32(entry + 4, little)
    const valueOffset = size > 4 ? view.getUint32(entry + 8, little) : entry + 8
    if (valueOffset + size > length) continue
    entries.push({ tag: view.getUint16(entry, little), type, valueOffset })
  }
  return entries
}

function applyEntry(reader: Reader, entry: Entry, result: Exif) {
  const { view, little } = reader
  const { tag, type, valueOffset } = entry
  if (tag === TAG_ISO && type === 3) {
    result.iso = `ISO ${view.getUint16(valueOffset, little)}`
  } else if (tag === TAG_EXPOSURE_TIME && type === 5) {
    result.shutter = formatShutter(readRational(view, valueOffset, little))
  } else if (tag === TAG_F_NUMBER && type === 5) {
    const f = readRational(view, valueOffset, little)
    if (f > 0) result.aperture = `f/${Number(f.toFixed(1))}`
  }
}

function parseTiff(tiff: Uint8Array): Exif | null {
  if (tiff.length < 8) return null
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength)
  const little = view.getUint16(0) === 0x4949
  if (view.getUint16(2, little) !== 0x2a) return null

  const reader: Reader = { view, little, length: tiff.length }
  const result: Exif = { iso: null, shutter: null, aperture: null }

  const ifd0 = readEntries(reader, view.getUint32(4, little))
  const exifPointer = ifd0.find((e) => e.tag === TAG_EXIF_IFD)
  const exifIfd = exifPointer
    ? readEntries(reader, view.getUint32(exifPointer.valueOffset, little))
    : []

  for (const entry of [...ifd0, ...exifIfd]) applyEntry(reader, entry, result)

  if (!result.iso && !result.shutter && !result.aperture) return null
  return result
}

export function readExif(dataUrl: string): Exif | null {
  const bytes = decodeDataUrl(dataUrl)
  if (!bytes) return null
  const tiff = findTiffInJpeg(bytes) ?? findTiffInPng(bytes)
  if (!tiff) return null
  try {
    return parseTiff(tiff)
  } catch {
    return null
  }
}
