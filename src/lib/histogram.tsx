import { SelectControl } from 'dialkit'
import { Layers, Rows3 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { LoadedImage } from './image/load'
import { useImage } from './image/state'
import type { Transfer } from './image/transfer'
import persisted, { type HistogramMode, type HistogramScale } from './persisted'
import { Section, SectionAction } from './ui/panel'

const LEVELS = 256
const BINS = 512
const AXIS_HEIGHT = 16
const AXIS_PADDING = 14
const LABEL_GAP = 4
const SAMPLE_SIDE = 256

const NITS_ANCHORS = [0, 1, 10, 100, 1000, 10000]
const NITS_SEGMENTS = NITS_ANCHORS.length - 1

const SCALE_OPTIONS: Array<{ value: HistogramScale; label: string }> = [
  { value: '10-bit', label: '10-bit' },
  { value: '12-bit', label: '12-bit' },
  { value: 'nits', label: 'Nits' },
]

type CodeScale = { max: number; labelStep: number; tickStep: number }
const CODE_SCALES: Record<Exclude<HistogramScale, 'nits'>, CodeScale> = {
  '10-bit': { max: 1023, labelStep: 128, tickStep: 32 },
  '12-bit': { max: 4095, labelStep: 512, tickStep: 128 },
}

type Size = { width: number; height: number }
const GRID_COLOR = 'rgba(234, 179, 8, 0.7)'
const TICK_COLOR = 'rgba(234, 179, 8, 0.3)'
const LABEL_COLOR = 'rgba(234, 179, 8, 1)'

type Channels = {
  r: Array<number>
  g: Array<number>
  b: Array<number>
}

type Band = { top: number; bottom: number }
type Span = { left: number; right: number }

function plotSpan(width: number): Span {
  return { left: AXIS_PADDING, right: width - AXIS_PADDING }
}

function fractionToX({ left, right }: Span, fraction: number): number {
  return Math.round(left + fraction * (right - left - 1)) + 0.5
}

const CHANNEL_COLORS = {
  r: 'rgba(239, 68, 68, 0.55)',
  g: 'rgba(34, 197, 94, 0.55)',
  b: 'rgba(59, 130, 246, 0.55)',
} as const

const CANVAS_ASPECT: Record<HistogramMode, string> = {
  overlay: 'aspect-[8/3]',
  separate: 'aspect-[8/5]',
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

// Position on the nits axis as a fraction of the width.
// The first segment [0, 1] is linear; each following segment is one decade.
function nitsToFraction(nits: number): number {
  if (nits <= 1) return nits / NITS_SEGMENTS
  return (1 + Math.log10(Math.min(nits, 10000))) / NITS_SEGMENTS
}

function levelToFraction(scale: HistogramScale, transfer: Transfer) {
  if (scale !== 'nits') return (level: number) => level / (LEVELS - 1)
  const toNits = CODE_TO_NITS[transfer]
  return (level: number) => nitsToFraction(toNits(level / (LEVELS - 1)))
}

function levelToBin(scale: HistogramScale, transfer: Transfer): Array<number> {
  const toFraction = levelToFraction(scale, transfer)
  return Array.from({ length: LEVELS }, (_, level) =>
    Math.min(BINS - 1, Math.floor(toFraction(level) * BINS)),
  )
}

function countChannels(
  data: Uint8ClampedArray,
  scale: HistogramScale,
  transfer: Transfer,
): Channels {
  const bins = levelToBin(scale, transfer)
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
  { left, right }: Span,
  { top, bottom }: Band,
) {
  const plotHeight = bottom - top
  const step = (right - left) / BINS
  ctx.beginPath()
  ctx.moveTo(left, bottom)
  for (let i = 0; i < BINS; i++) {
    ctx.lineTo(left + i * step, bottom - (values[i] / max) * plotHeight)
  }
  ctx.lineTo(right, bottom)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

type Axis = {
  anchors: Array<number>
  toX: (value: number) => number
  ticks: Array<number>
}

function codeAxis({ max, labelStep, tickStep }: CodeScale, span: Span): Axis {
  const toX = (code: number) => fractionToX(span, code / max)
  const anchors = [
    ...Array.from(
      { length: Math.ceil(max / labelStep) },
      (_, i) => i * labelStep,
    ),
    max,
  ]
  const ticks: Array<number> = []
  for (let code = tickStep; code < max; code += tickStep) {
    if (code % labelStep !== 0) ticks.push(toX(code))
  }
  return { anchors, toX, ticks }
}

function nitsAxis(span: Span): Axis {
  const toX = (nits: number) => fractionToX(span, nitsToFraction(nits))
  const ticks: Array<number> = []
  for (let segment = 0; segment < NITS_SEGMENTS; segment++) {
    for (let step = 2; step < 10; step++) {
      ticks.push(
        fractionToX(span, (segment + Math.log10(step)) / NITS_SEGMENTS),
      )
    }
  }
  return { anchors: NITS_ANCHORS, toX, ticks }
}

function drawAxis(
  ctx: CanvasRenderingContext2D,
  scale: HistogramScale,
  { width, height }: Size,
) {
  const span = plotSpan(width)
  const { anchors, toX, ticks } =
    scale === 'nits' ? nitsAxis(span) : codeAxis(CODE_SCALES[scale], span)
  const last = anchors.length - 1
  ctx.save()
  ctx.lineWidth = 1

  ctx.strokeStyle = TICK_COLOR
  ctx.beginPath()
  for (const x of ticks) {
    ctx.moveTo(x, AXIS_HEIGHT - 4)
    ctx.lineTo(x, AXIS_HEIGHT)
  }
  ctx.stroke()

  ctx.strokeStyle = GRID_COLOR
  ctx.fillStyle = LABEL_COLOR
  ctx.font = '10px sans-serif'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  for (const value of anchors) {
    const x = toX(value)
    ctx.beginPath()
    ctx.moveTo(x, AXIS_HEIGHT - 6)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  const labels = anchors.map((value) => {
    const text = String(value)
    const textWidth = ctx.measureText(text).width
    const left = toX(value) - textWidth / 2
    return { text, left, right: left + textWidth }
  })

  const lastLabel = labels[last]
  let occupiedRight = Number.NEGATIVE_INFINITY
  labels.forEach((label, index) => {
    const isEdge = index === 0 || index === last
    const collides =
      label.left < occupiedRight + LABEL_GAP ||
      (index !== last && label.right > lastLabel.left - LABEL_GAP)
    if (!isEdge && collides) return
    ctx.fillText(label.text, label.left, 0)
    occupiedRight = label.right
  })

  ctx.restore()
}

function drawHistogram(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  transfer: Transfer,
  mode: HistogramMode,
  scale: HistogramScale,
  size: Size,
) {
  const sample = document.createElement('canvas')
  const sampleCtx = sample.getContext('2d')
  if (!sampleCtx) return

  const shrink = Math.min(1, SAMPLE_SIDE / Math.max(img.width, img.height))
  sample.width = Math.max(1, Math.round(img.width * shrink))
  sample.height = Math.max(1, Math.round(img.height * shrink))
  sampleCtx.drawImage(img, 0, 0, sample.width, sample.height)

  const { data } = sampleCtx.getImageData(0, 0, sample.width, sample.height)
  const { r, g, b } = countChannels(data, scale, transfer)
  const max = Math.max(...r, ...g, ...b)

  ctx.clearRect(0, 0, size.width, size.height)
  ctx.globalCompositeOperation = 'source-over'
  drawAxis(ctx, scale, size)
  const span = plotSpan(size.width)
  const channels = { r, g, b }
  const keys = ['r', 'g', 'b'] as const

  if (mode === 'overlay') {
    ctx.globalCompositeOperation = 'screen'
    const band = { top: AXIS_HEIGHT, bottom: size.height }
    for (const key of keys) {
      drawChannel(ctx, channels[key], max, CHANNEL_COLORS[key], span, band)
    }
    return
  }

  const bandHeight = (size.height - AXIS_HEIGHT) / keys.length
  keys.forEach((key, index) => {
    const top = AXIS_HEIGHT + index * bandHeight
    const band = { top, bottom: top + bandHeight }
    drawChannel(ctx, channels[key], max, CHANNEL_COLORS[key], span, band)
  })
}

function render(
  canvas: HTMLCanvasElement,
  image: LoadedImage,
  mode: HistogramMode,
  scale: HistogramScale,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const size = { width: canvas.clientWidth, height: canvas.clientHeight }
  if (size.width === 0 || size.height === 0) return
  canvas.width = Math.round(size.width * dpr)
  canvas.height = Math.round(size.height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  drawHistogram(ctx, image.thumbnail, image.transfer, mode, scale, size)
}

type HistogramProps = { mode: HistogramMode; scale: HistogramScale }

function Histogram({ mode, scale }: HistogramProps) {
  const image = useImage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exif = image?.exif ?? null
  const hasCameraInfo = Boolean(exif?.iso || exif?.shutter || exif?.aperture)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!image || !canvas) return
    const observer = new ResizeObserver(() =>
      render(canvas, image, mode, scale),
    )
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [image, mode, scale])

  return (
    <div className="overflow-hidden rounded-row bg-surface">
      <canvas
        ref={canvasRef}
        className={`block w-full ${CANVAS_ASPECT[mode]}`}
      />
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

export default function HistogramSection() {
  const [mode, setMode] = useState<HistogramMode>(() =>
    persisted.read((store) => store.histogramMode),
  )

  const [scale, setScale] = useState<HistogramScale>(() =>
    persisted.read((store) => store.histogramScale),
  )

  const selectScale = (value: string) => {
    const next = value as HistogramScale
    setScale(next)
    persisted.write((draft) => {
      draft.histogramScale = next
    })
  }

  const toggleMode = () => {
    const next: HistogramMode = mode === 'overlay' ? 'separate' : 'overlay'
    setMode(next)
    persisted.write((draft) => {
      draft.histogramMode = next
    })
  }

  return (
    <Section
      title="Histogram"
      actions={
        <SectionAction
          label={mode === 'overlay' ? 'Separate channels' : 'Overlay channels'}
          onClick={toggleMode}
        >
          {mode === 'overlay' ? (
            <Rows3 className="size-3.5" />
          ) : (
            <Layers className="size-3.5" />
          )}
        </SectionAction>
      }
    >
      <Histogram mode={mode} scale={scale} />
      <SelectControl
        label="Scale"
        value={scale}
        options={SCALE_OPTIONS}
        onChange={selectScale}
      />
    </Section>
  )
}
