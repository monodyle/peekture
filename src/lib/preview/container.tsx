import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../cn'
import { useImage } from '../image/state'
import Loading from './loading'
import Render from './render'
import ZoomLevel from './zoom-level'

export default function PreviewContainer() {
  const image = useImage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleZoom = useCallback((delta: number) => {
    setScale((prevScale) => {
      const newScale = prevScale + delta
      return Math.min(Math.max(0.1, newScale), 5) // Limit zoom between 10% and 500%
    })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    },
    [position.x, position.y],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart.x, dragStart.y],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault()
          handleZoom(0.1)
        } else if (e.key === '-') {
          e.preventDefault()
          handleZoom(-0.1)
        } else if (e.key === '0') {
          e.preventDefault()
          resetView()
        }
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        handleZoom(delta)
      }
    }

    containerRef.current?.addEventListener('wheel', handleWheel, {
      passive: false,
    })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      containerRef.current?.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleZoom, resetView])

  if (!image) return null

  return (
    <div className="grid max-h-full overflow-hidden rounded bg-neutral-900 place-items-center">
      <div className="relative flex w-full h-full overflow-hidden rounded-lg select-none">
        <div
          ref={containerRef}
          className={cn(
            'relative w-full h-full flex items-center justify-center',
            isDragging && 'cursor-grabbing',
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={resetView}
        >
          <div
            className="max-w-full max-h-full select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 100ms ease-out',
            }}
          >
            <Render />
          </div>
        </div>
        <div className="absolute bottom-2 right-2">
          <ZoomLevel
            scale={scale}
            zoomIn={() => handleZoom(0.1)}
            zoomOut={() => handleZoom(-0.1)}
          />
        </div>
        <Loading />
      </div>
    </div>
  )
}
