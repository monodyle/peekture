import { type Dimensions, readDimensions } from './dimensions'
import { type Exif, isRotated, readExif } from './exif'
import { readTransfer, type Transfer } from './transfer'

export const MAX_PREVIEW_SIDE = 4096
export const THUMBNAIL_SIDE = 320
export const MAX_PIXELS = 100_000_000

export class ImageTooLargeError extends Error {
  constructor(size: Dimensions) {
    super(`Image is ${size.width} x ${size.height}, above the pixel limit`)
    this.name = 'ImageTooLargeError'
  }
}

export type LoadedImage = {
  source: Blob
  width: number
  height: number
  bitmap: ImageBitmap
  thumbnail: ImageBitmap
  exif: Exif | null
  transfer: Transfer
  resized: boolean
}

function fitWithin(size: Dimensions, maxSide: number): Dimensions {
  const scale = Math.min(1, maxSide / Math.max(size.width, size.height))
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  }
}

function assertWithinBudget(size: Dimensions) {
  if (size.width * size.height > MAX_PIXELS) throw new ImageTooLargeError(size)
}

function resize(source: ImageBitmapSource, target: Dimensions) {
  return createImageBitmap(source, {
    resizeWidth: target.width,
    resizeHeight: target.height,
    resizeQuality: 'high',
  })
}

// Without header dimensions the browser must decode at full size first,
// so the budget check runs after decode and the full bitmap is released.
async function decode(source: Blob, size: Dimensions | null) {
  if (size) {
    assertWithinBudget(size)
    return resize(source, fitWithin(size, MAX_PREVIEW_SIDE))
  }
  const full = await createImageBitmap(source)
  const target = fitWithin(full, MAX_PREVIEW_SIDE)
  if (target.width === full.width && target.height === full.height) {
    return full
  }
  try {
    assertWithinBudget(full)
    return await resize(full, target)
  } finally {
    full.close()
  }
}

export async function loadImage(source: Blob): Promise<LoadedImage> {
  const [size, bytes] = await Promise.all([
    readDimensions(source),
    source.arrayBuffer(),
  ])
  const header = new Uint8Array(bytes)
  const exif = readExif(header)
  const transfer = readTransfer(header)
  const oriented =
    size && isRotated(exif) ? { width: size.height, height: size.width } : size
  const bitmap = await decode(source, oriented)
  const thumbnailSize = fitWithin(bitmap, THUMBNAIL_SIDE)
  const thumbnail = await createImageBitmap(bitmap, {
    resizeWidth: thumbnailSize.width,
    resizeHeight: thumbnailSize.height,
    resizeQuality: 'high',
  })
  const width = oriented?.width ?? bitmap.width
  const height = oriented?.height ?? bitmap.height
  return {
    source,
    width,
    height,
    bitmap,
    thumbnail,
    exif,
    transfer,
    resized: bitmap.width < width || bitmap.height < height,
  }
}

export function releaseImage(image: LoadedImage | null) {
  image?.bitmap.close()
  image?.thumbnail.close()
}
