import { Toolbar } from '@base-ui/react/toolbar'
import { Tooltip } from '@base-ui/react/tooltip'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

type ZoomLevelProps = {
  scale: number
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

type ZoomButtonProps = {
  label: string
  hint: string
  onClick: () => void
  children: ReactNode
}

function ZoomButton({ label, hint, onClick, children }: ZoomButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<Toolbar.Button />}
        aria-label={label}
        onClick={onClick}
        className="grid size-7 place-items-center rounded-[6px] text-label transition-colors duration-150 hover:bg-surface-hover hover:text-white"
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={8}>
          <Tooltip.Popup className="flex items-center gap-2 rounded-[6px] border border-line bg-panel px-2 py-1 text-[12px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-[opacity,transform] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
            <span>{label}</span>
            <kbd className="rounded-[4px] bg-surface-hover px-1 font-sans text-[11px] text-label">
              {hint}
            </kbd>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default function ZoomLevel({
  scale,
  zoomIn,
  zoomOut,
  reset,
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
      <ZoomButton label="Reset" hint="Ctrl 0" onClick={reset}>
        <RotateCcw className="size-3.5" />
      </ZoomButton>
    </Toolbar.Root>
  )
}
