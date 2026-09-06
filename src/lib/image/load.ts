import { type Dimensions, readDimensions } from './dimensions'
import { type Exif, readExif } from './exif'

export const MAX_PREVIEW_SIDE = 4096
export const THUMBNAIL_SIDE = 320

export type LoadedImage = {
  source: Blob
  width: number
  height: number
  bitmap: ImageBitmap
  thumbnail: ImageBitmap
  exif: Exif | null
}

function fitWithin(size: Dimensions, maxSide: number): Dimensions {
  const scale = Math.min(1, maxSide / Math.max(size.width, size.height))
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  }
}

async function decode(source: Blob, size: Dimensions | null) {
  if (!size) return createImageBitmap(source)
  const target = fitWithin(size, MAX_PREVIEW_SIDE)
  return createImageBitmap(source, {
    resizeWidth: target.width,
    resizeHeight: target.height,
    resizeQuality: 'high',
  })
}

export async function loadImage(source: Blob): Promise<LoadedImage> {
  const [size, bytes] = await Promise.all([
    readDimensions(source),
    source.arrayBuffer(),
  ])
  const exif = readExif(new Uint8Array(bytes))
  const bitmap = await decode(source, size)
  const thumbnailSize = fitWithin(bitmap, THUMBNAIL_SIDE)
  const thumbnail = await createImageBitmap(bitmap, {
    resizeWidth: thumbnailSize.width,
    resizeHeight: thumbnailSize.height,
    resizeQuality: 'high',
  })
  return {
    source,
    width: size?.width ?? bitmap.width,
    height: size?.height ?? bitmap.height,
    bitmap,
    thumbnail,
    exif,
  }
}

export function releaseImage(image: LoadedImage | null) {
  image?.bitmap.close()
  image?.thumbnail.close()
}
