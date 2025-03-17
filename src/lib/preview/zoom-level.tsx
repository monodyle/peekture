import { Plus, Minus } from 'lucide-react'

type ZoomLevelProps = {
  scale: number
  zoomIn: () => void
  zoomOut: () => void
}
export default function ZoomLevel({ scale, zoomIn, zoomOut }: ZoomLevelProps) {
  const currentZoom = Math.round(scale * 100)

  return (
    <div className="flex items-center gap-2 bg-neutral-900/75 rounded">
      <button
        type="button"
        className="p-1 hover:bg-neutral-800 rounded"
        onClick={zoomOut}
      >
        <Minus className="size-4" />
      </button>
      <span className="text-sm text-neutral-400">{currentZoom}%</span>
      <button type="button" className="p-1 hover:bg-neutral-800 rounded" onClick={zoomIn}>
        <Plus className="size-4" />
      </button>
    </div>
  )
}
