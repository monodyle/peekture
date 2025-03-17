import { useEffect, useRef } from 'react'
import { useImage } from './image/state'

export default function Histogram() {
  const image = useImage()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      // Create a temporary canvas to read image data
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      // Set canvas dimensions
      tempCanvas.width = img.naturalWidth
      tempCanvas.height = img.naturalHeight
      canvas.width = 256 // One pixel per brightness level
      canvas.height = 150

      // Draw image to temp canvas to get pixel data
      tempCtx.drawImage(img, 0, 0)
      const imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      )
      const data = imageData.data

      // Initialize histogram data array (256 levels for each RGB channel)
      const histogramR = Array(256).fill(0)
      const histogramG = Array(256).fill(0)
      const histogramB = Array(256).fill(0)

      // Calculate histogram values
      for (let i = 0; i < data.length; i += 4) {
        histogramR[data[i]]++ // Red
        histogramG[data[i + 1]]++ // Green
        histogramB[data[i + 2]]++ // Blue
      }

      // Find the maximum frequency for scaling
      const maxFrequency = Math.max(
        Math.max(...histogramR),
        Math.max(...histogramG),
        Math.max(...histogramB),
      )

      // Clear canvas
      ctx.fillStyle = '#171717' // neutral-900
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw histogram lines
      const drawChannel = (data: number[], color: string, alpha = 1) => {
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.globalAlpha = alpha

        for (let i = 0; i < 256; i++) {
          const x = i
          const y = canvas.height - (data[i] / maxFrequency) * canvas.height
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()
      }

      // Draw histograms for each channel
      drawChannel(histogramR, '#ef4444', 0.8) // Red
      drawChannel(histogramG, '#22c55e', 0.8) // Green
      drawChannel(histogramB, '#3b82f6', 0.8) // Blue
    }
  }, [image])

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-tight uppercase text-neutral-500">
        Histogram
      </p>
      <div className="w-full h-full overflow-hidden border bg-neutral-900 border-neutral-800">
        <canvas ref={canvasRef} className="w-full aspect-[3/1]" />
      </div>
    </div>
  )
}
