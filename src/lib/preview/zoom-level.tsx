import { Toolbar } from '@base-ui/react/toolbar'
import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Tooltip } from '../ui/tooltip'

type ZoomLevelProps = {
  scale: number
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  actualSize: () => void
}

type ZoomButtonProps = {
  label: string
  hint: string | string[]
  onClick: () => void
  children: ReactNode
}

function ZoomButton({ label, hint, onClick, children }: ZoomButtonProps) {
  return (
    <Tooltip label={label} hint={hint}>
      <Toolbar.Button
        aria-label={label}
        onClick={onClick}
        className="grid size-7 place-items-center rounded-[6px] text-label transition-colors duration-150 hover:bg-surface-hover hover:text-white"
      >
        {children}
      </Toolbar.Button>
    </Tooltip>
  )
}

export default function ZoomLevel({
  scale,
  zoomIn,
  zoomOut,
  reset,
  actualSize,
}: ZoomLevelProps) {
  const currentZoom = Math.round(scale * 100)

  return (
    <Toolbar.Root
      aria-label="Zoom"
      className="flex items-center gap-0.5 rounded-[10px] border border-line bg-panel/90 p-1 shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md"
    >
      <ZoomButton label="Zoom out" hint="Ctrl -" onClick={zoomOut}>
        <Minus className="size-3.5" />
      </ZoomButton>
      <span className="min-w-11 text-center text-[12px] font-medium text-label tabular-nums">
        {currentZoom}%
      </span>
      <ZoomButton label="Zoom in" hint="Ctrl +" onClick={zoomIn}>
        <Plus className="size-3.5" />
      </ZoomButton>
      <Toolbar.Separator className="mx-0.5 h-4 w-px bg-line" />
      <ZoomButton label="Actual size" hint="Shift 1" onClick={actualSize}>
        <Maximize2 className="size-3.5" />
      </ZoomButton>
      <ZoomButton label="Fit" hint={['Ctrl 0', 'Shift 0']} onClick={reset}>
        <RotateCcw className="size-3.5" />
      </ZoomButton>
    </Toolbar.Root>
  )
}
