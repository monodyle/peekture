import { useEffect, useRef } from 'react'
import type { LoadedImage } from './image/load'
import { useImage } from './image/state'
import type { Transfer } from './image/transfer'

const LEVELS = 256
const BINS = 512
const AXIS_HEIGHT = 16
const SAMPLE_SIDE = 256

const ANCHORS = [0, 1, 10, 100, 1000, 10000]
const SEGMENTS = ANCHORS.length - 1

type Size = { width: number; height: number }
const GRID_COLOR = 'rgba(234, 179, 8, 0.7)'
const TICK_COLOR = 'rgba(234, 179, 8, 0.3)'
const LABEL_COLOR = 'rgba(234, 179, 8, 1)'

type Channels = {
  r: Array<number>
  g: Array<number>
  b: Array<number>
}

// SMPTE ST 2084 (PQ) EOTF: normalized code value -> absolute luminance in nits.
function pqToNits(code: number): number {
  const m1 = 2610 / 16384
  const m2 = (2523 / 4096) * 128
  const c1 = 3424 / 4096
  const c2 = (2413 / 4096) * 32
  const c3 = (2392 / 4096) * 32
  const p = code ** (1 / m2)
  const num = Math.max(p - c1, 0)
  const den = c2 - c3 * p
  return 10000 * (num / den) ** (1 / m1)
}

// BT.2100 HLG: inverse OETF then OOTF for a 1000 nit display.
function hlgToNits(code: number): number {
  const a = 0.17883277
  const b = 1 - 4 * a
  const c = 0.5 - a * Math.log(4 * a)
  const scene =
    code <= 0.5 ? (code * code) / 3 : (Math.exp((code - c) / a) + b) / 12
  return 1000 * scene ** 1.2
}

// sRGB with a 100 nit reference white.
function srgbToNits(code: number): number {
  const linear =
    code <= 0.04045 ? code / 12.92 : ((code + 0.055) / 1.055) ** 2.4
  return 100 * linear
}

const CODE_TO_NITS: Record<Transfer, (code: number) => number> = {
  pq: pqToNits,
  hlg: hlgToNits,
  sdr: srgbToNits,
}

// Position on the axis as a fraction of the width.
// The first segment [0, 1] is linear; each following segment is one decade.
function nitsToFraction(nits: number): number {
  if (nits <= 1) return nits / SEGMENTS
  return (1 + Math.log10(Math.min(nits, 10000))) / SEGMENTS
}

function levelToBin(transfer: Transfer): Array<number> {
  const toNits = CODE_TO_NITS[transfer]
  return Array.from({ length: LEVELS }, (_, level) => {
    const fraction = nitsToFraction(toNits(level / (LEVELS - 1)))
    return Math.min(BINS - 1, Math.floor(fraction * BINS))
  })
}

function countChannels(data: Uint8ClampedArray, transfer: Transfer): Channels {
  const bins = levelToBin(transfer)
  const r = Array(BINS).fill(0)
  const g = Array(BINS).fill(0)
  const b = Array(BINS).fill(0)
  for (let i = 0; i < data.length; i += 4) {
    r[bins[data[i]]]++
    g[bins[data[i + 1]]]++
    b[bins[data[i + 2]]]++
  }
  return { r, g, b }
}

function drawChannel(
  ctx: CanvasRenderingContext2D,
  values: Array<number>,
  max: number,
  color: string,
  { width, height }: Size,
) {
  const plotHeight = height - AXIS_HEIGHT
  const step = width / BINS
  ctx.beginPath()
  ctx.moveTo(0, height)
  for (let i = 0; i < BINS; i++) {
    ctx.lineTo(i * step, height - (values[i] / max) * plotHeight)
  }
  ctx.lineTo(width, height)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function drawAxis(ctx: CanvasRenderingContext2D, { width, height }: Size) {
  const nitsToX = (nits: number) =>
    Math.round(nitsToFraction(nits) * (width - 1)) + 0.5
  ctx.save()
  ctx.lineWidth = 1

  ctx.strokeStyle = TICK_COLOR
  ctx.beginPath()
  const segmentWidth = (width - 1) / SEGMENTS
  for (let segment = 0; segment < SEGMENTS; segment++) {
    for (let step = 2; step < 10; step++) {
      const x = Math.round((segment + Math.log10(step)) * segmentWidth) + 0.5
      ctx.moveTo(x, AXIS_HEIGHT - 4)
      ctx.lineTo(x, AXIS_HEIGHT)
    }
  }
  ctx.stroke()

  ctx.strokeStyle = GRID_COLOR
  ctx.fillStyle = LABEL_COLOR
  ctx.font = '10px sans-serif'
  ctx.textBaseline = 'top'
  ANCHORS.forEach((nits, index) => {
    const x = nitsToX(nits)
    ctx.beginPath()
    ctx.moveTo(x, AXIS_HEIGHT - 6)
    ctx.lineTo(x, height)
    ctx.stroke()

    ctx.textAlign =
      index === 0 ? 'left' : index === ANCHORS.length - 1 ? 'right' : 'center'
    const labelX =
      index === 0 ? x + 2 : index === ANCHORS.length - 1 ? x - 2 : x
    ctx.fillText(String(nits), labelX, 0)
  })

  ctx.restore()
}

function drawHistogram(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  transfer: Transfer,
  size: Size,
) {
  const sample = document.createElement('canvas')
  const sampleCtx = sample.getContext('2d')
  if (!sampleCtx) return

  const scale = Math.min(1, SAMPLE_SIDE / Math.max(img.width, img.height))
  sample.width = Math.max(1, Math.round(img.width * scale))
  sample.height = Math.max(1, Math.round(img.height * scale))
  sampleCtx.drawImage(img, 0, 0, sample.width, sample.height)

  const { data } = sampleCtx.getImageData(0, 0, sample.width, sample.height)
  const { r, g, b } = countChannels(data, transfer)
  const max = Math.max(...r, ...g, ...b)

  ctx.clearRect(0, 0, size.width, size.height)
  ctx.globalCompositeOperation = 'source-over'
  drawAxis(ctx, size)
  ctx.globalCompositeOperation = 'screen'
  drawChannel(ctx, r, max, 'rgba(239, 68, 68, 0.55)', size)
  drawChannel(ctx, g, max, 'rgba(34, 197, 94, 0.55)', size)
  drawChannel(ctx, b, max, 'rgba(59, 130, 246, 0.55)', size)
}

function render(canvas: HTMLCanvasElement, image: LoadedImage) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const size = { width: canvas.clientWidth, height: canvas.clientHeight }
  if (size.width === 0 || size.height === 0) return
  canvas.width = Math.round(size.width * dpr)
  canvas.height = Math.round(size.height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  drawHistogram(ctx, image.thumbnail, image.transfer, size)
}

export default function Histogram() {
  const image = useImage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exif = image?.exif ?? null
  const hasCameraInfo = Boolean(exif?.iso || exif?.shutter || exif?.aperture)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!image || !canvas) return
    const observer = new ResizeObserver(() => render(canvas, image))
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [image])

  return (
    <div className="overflow-hidden rounded-row bg-surface">
      <canvas ref={canvasRef} className="block aspect-[8/3] w-full" />
      {exif && hasCameraInfo && (
        <div className="flex items-center justify-between px-2 py-1 text-muted text-xs tabular-nums">
          <span>{exif.iso}</span>
          <span>{exif.shutter}</span>
          <span>{exif.aperture}</span>
        </div>
      )}
    </div>
  )
}
