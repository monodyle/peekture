import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../cn'
import { useImage } from '../image/state'
import Loading from './loading'
import Render from './render'
import ZoomLevel from './zoom-level'

const ZOOM_STEP = 0.1

function isModifierPressed(e: KeyboardEvent | WheelEvent) {
  return e.ctrlKey || e.metaKey
}

function zoomDeltaForKey(key: string) {
  if (key === '=' || key === '+') return ZOOM_STEP
  if (key === '-') return -ZOOM_STEP
  return null
}

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
      if (!isModifierPressed(e)) return
      if (e.key === '0') {
        e.preventDefault()
        resetView()
        return
      }
      const delta = zoomDeltaForKey(e.key)
      if (delta === null) return
      e.preventDefault()
      handleZoom(delta)
    }

    const handleWheel = (e: WheelEvent) => {
      if (!isModifierPressed(e)) return
      e.preventDefault()
      handleZoom(e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)
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
    <div className="grid max-h-full place-items-center overflow-hidden">
      <div className="relative flex h-full w-full select-none overflow-hidden">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: mouse-only pan surface, keyboard reset is handled on window */}
        <div
          ref={containerRef}
          className={cn(
            'relative flex h-full w-full cursor-grab items-center justify-center',
            isDragging && 'cursor-grabbing',
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={resetView}
        >
          <div
            className="flex h-full w-full select-none items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 100ms ease-out',
            }}
          >
            <Render zoom={scale} />
          </div>
        </div>
        <div className="absolute right-3 bottom-3">
          <ZoomLevel
            scale={scale}
            zoomIn={() => handleZoom(ZOOM_STEP)}
            zoomOut={() => handleZoom(-ZOOM_STEP)}
            reset={resetView}
          />
        </div>
        <Loading />
      </div>
    </div>
  )
}
