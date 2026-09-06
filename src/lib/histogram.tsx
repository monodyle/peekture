import { useEffect, useMemo, useRef } from 'react'
import { readExif } from './image/exif'
import { useImage } from './image/state'

const LEVELS = 256
const HEIGHT = 96

type Channels = {
  r: Array<number>
  g: Array<number>
  b: Array<number>
}

function countChannels(data: Uint8ClampedArray): Channels {
  const r = Array(LEVELS).fill(0)
  const g = Array(LEVELS).fill(0)
  const b = Array(LEVELS).fill(0)
  for (let i = 0; i < data.length; i += 4) {
    r[data[i]]++
    g[data[i + 1]]++
    b[data[i + 2]]++
  }
  return { r, g, b }
}

function drawChannel(
  ctx: CanvasRenderingContext2D,
  values: Array<number>,
  max: number,
  color: string,
) {
  ctx.beginPath()
  ctx.moveTo(0, HEIGHT)
  for (let i = 0; i < LEVELS; i++) {
    ctx.lineTo(i, HEIGHT - (values[i] / max) * HEIGHT)
  }
  ctx.lineTo(LEVELS - 1, HEIGHT)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function drawHistogram(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const sample = document.createElement('canvas')
  const sampleCtx = sample.getContext('2d')
  if (!sampleCtx) return

  sample.width = img.naturalWidth
  sample.height = img.naturalHeight
  sampleCtx.drawImage(img, 0, 0)

  const { data } = sampleCtx.getImageData(0, 0, sample.width, sample.height)
  const { r, g, b } = countChannels(data)
  const max = Math.max(...r, ...g, ...b)

  ctx.clearRect(0, 0, LEVELS, HEIGHT)
  ctx.globalCompositeOperation = 'screen'
  drawChannel(ctx, r, max, 'rgba(239, 68, 68, 0.55)')
  drawChannel(ctx, g, max, 'rgba(34, 197, 94, 0.55)')
  drawChannel(ctx, b, max, 'rgba(59, 130, 246, 0.55)')
}

export default function Histogram() {
  const image = useImage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exif = useMemo(() => (image ? readExif(image) : null), [image])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!image || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = LEVELS
    canvas.height = HEIGHT

    const img = new Image()
    img.src = image
    img.onload = () => drawHistogram(ctx, img)
  }, [image])

  return (
    <div className="overflow-hidden rounded-row bg-surface">
      <canvas ref={canvasRef} className="block aspect-[8/3] w-full" />
      {exif && (
        <div className="flex items-center justify-between px-2 py-1 text-muted text-xs tabular-nums">
          <span>{exif.iso}</span>
          <span>{exif.shutter}</span>
          <span>{exif.aperture}</span>
        </div>
      )}
    </div>
  )
}
