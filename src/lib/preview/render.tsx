import { useEffect, useRef, useState } from 'react'
import { cn } from '../cn'
import { useImage } from '../image/state'
import { useIntensity, useLUT } from '../lut/state'
import { useLUTWorker } from '../lut/use-lut-worker'

type Size = { width: number; height: number }

const RESIZE_DELAY_MS = 150

function fitSize(image: HTMLImageElement, box: Size, zoom: number): Size {
  const dpr = window.devicePixelRatio || 1
  const scale = Math.min(
    1,
    (box.width * dpr * zoom) / image.naturalWidth,
    (box.height * dpr * zoom) / image.naturalHeight,
  )
  return {
    width: Math.max(1, Math.round(image.naturalWidth * scale)),
    height: Math.max(1, Math.round(image.naturalHeight * scale)),
  }
}

function useBoxSize(ref: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<Size | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setBox({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return box
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
  const lut = useLUT()
  const intensity = useIntensity()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const size = useDebounced(useBoxSize(boxRef), RESIZE_DELAY_MS)
  const targetZoom = useDebounced(zoom, RESIZE_DELAY_MS)
  const [sourceVersion, setSourceVersion] = useState(0)
  const [isRendering, setIsRendering] = useState(false)
  const { setSource, apply } = useLUTWorker()

  useEffect(() => {
    if (!image || !size) return

    let cancelled = false
    const imageElement = new Image()
    imageElement.src = image
    imageElement.onload = () => {
      if (cancelled) return
      const target = fitSize(imageElement, size, targetZoom)
      const offscreen = document.createElement('canvas')
      offscreen.width = target.width
      offscreen.height = target.height
      const ctx = offscreen.getContext('2d')
      if (!ctx) return
      ctx.drawImage(imageElement, 0, 0, target.width, target.height)
      setSource(ctx.getImageData(0, 0, target.width, target.height))
      setSourceVersion((version) => version + 1)
    }

    return () => {
      cancelled = true
    }
  }, [image, size, targetZoom, setSource])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || sourceVersion === 0) return

    setIsRendering(true)
    apply({
      lut,
      intensity: intensity / 100,
      onDone: (result) => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        if (canvas.width !== result.width) canvas.width = result.width
        if (canvas.height !== result.height) canvas.height = result.height
        ctx.putImageData(result, 0, 0)
        setIsRendering(false)
      },
    })
  }, [sourceVersion, lut, intensity, apply])

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
