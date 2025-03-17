import { useRef, useEffect } from 'react'
import type { LUT } from '../lut/types'
import applyLUT from './appy'

type ImageRenderProps = {
  image: string
  lut: LUT
}

export default function LUTPreview({ image, lut }: ImageRenderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const { width, height } = parent.getBoundingClientRect()
      canvas.width = width
      canvas.height = height

      const baseScale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height,
      )

      const scaledWidth = img.width * baseScale
      const scaledHeight = img.height * baseScale

      const x = (canvas.width - scaledWidth) / 2
      const y = (canvas.height - scaledHeight) / 2

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const applied = applyLUT(imageData, lut)

      ctx.putImageData(applied, 0, 0)
    }
  }, [image, lut])

  return <canvas ref={canvasRef} width="100%" height="100%" />
}
