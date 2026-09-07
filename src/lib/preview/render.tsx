import { useEffect, useRef, useState } from 'react'
import { useAdjustments } from '../adjustments/state'
import { cn } from '../cn'
import { useImage, useImageLoading } from '../image/state'
import { useIntensity, useLUT } from '../lut/state'
import { useLUTWorker } from '../lut/use-lut-worker'
import { type Size, useBoxSize } from './use-box-size'

const RESIZE_DELAY_MS = 150

function fitSize(image: ImageBitmap, box: Size, zoom: number): Size {
  const dpr = window.devicePixelRatio || 1
  const scale = Math.min(
    1,
    (box.width * dpr * zoom) / image.width,
    (box.height * dpr * zoom) / image.height,
  )
  return {
    width: Math.max(1, Math.round(image.width * scale)),
    height: Math.max(1, Math.round(image.height * scale)),
  }
}

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

type RenderProps = {
  zoom: number
}

export default function Render({ zoom }: RenderProps) {
  const image = useImage()
  const { finishLoading } = useImageLoading()
  const lut = useLUT()
  const intensity = useIntensity()
  const adjustments = useAdjustments()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const size = useDebounced(useBoxSize(boxRef), RESIZE_DELAY_MS)
  const targetZoom = useDebounced(zoom, RESIZE_DELAY_MS)
  const [sourceVersion, setSourceVersion] = useState(0)
  const [isRendering, setIsRendering] = useState(false)
  const { setSource, apply } = useLUTWorker()

  useEffect(() => {
    if (!image || !size) return

    const target = fitSize(image.bitmap, size, targetZoom)
    const offscreen = document.createElement('canvas')
    offscreen.width = target.width
    offscreen.height = target.height
    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      finishLoading()
      return
    }
    ctx.drawImage(image.bitmap, 0, 0, target.width, target.height)
    setSource(ctx.getImageData(0, 0, target.width, target.height))
    setSourceVersion((version) => version + 1)
  }, [image, size, targetZoom, setSource, finishLoading])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || sourceVersion === 0) return

    setIsRendering(true)
    apply({
      lut,
      intensity: intensity / 100,
      adjustments,
      onDone: (result) => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        if (canvas.width !== result.width) canvas.width = result.width
        if (canvas.height !== result.height) canvas.height = result.height
        ctx.putImageData(result, 0, 0)
        setIsRendering(false)
        finishLoading()
      },
    })
  }, [sourceVersion, lut, intensity, adjustments, apply, finishLoading])

  return (
    <div
      ref={boxRef}
      className="flex h-full w-full items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className={cn(
          'max-h-full max-w-full object-contain transition-opacity',
          isRendering && 'animate-pulse',
        )}
      />
    </div>
  )
}
