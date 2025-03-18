import { useEffect, useRef } from 'react'
import { useImage } from '../image/state'
import { useLUT } from '../lut/state'
import applyLUT from '../lut/apply'

export default function Render() {
  const image = useImage()
  const lut = useLUT()
  const containerRef = useRef<HTMLCanvasElement>(null)
  // const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    if (!image || !containerRef.current) {
      return
    }

    const canvas = containerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const imageElement = new Image()
    imageElement.src = image
    imageElement.onload = () => {
      canvas.width = imageElement.width
      canvas.height = imageElement.height

      const baseScale = Math.max(
        canvas.width / imageElement.width,
        canvas.height / imageElement.height,
      )

      const scaledWidth = imageElement.width * baseScale
      const scaledHeight = imageElement.height * baseScale

      const x = (canvas.width - scaledWidth) / 2
      const y = (canvas.height - scaledHeight) / 2

      ctx.drawImage(imageElement, x, y, scaledWidth, scaledHeight)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const applied = applyLUT(imageData, lut)

      ctx.putImageData(applied, 0, 0)
    }
  }, [image, lut])

  return <canvas ref={containerRef} />
}
