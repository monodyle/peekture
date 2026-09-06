import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import type { ReactElement, ReactNode } from 'react'

type TooltipProps = {
  label: ReactNode
  hint?: string | string[]
  side?: 'top' | 'bottom' | 'left' | 'right'
  // Keep the tooltip open when the trigger is clicked, so a label that
  // changes on click stays visible.
  keepOpenOnPress?: boolean
  // The element that shows the tooltip. It receives the trigger props.
  children: ReactElement
}

export function Tooltip({
  label,
  hint,
  side = 'top',
  keepOpenOnPress = false,
  children,
}: TooltipProps) {
  const keys = hint ? [hint].flat() : []

  return (
    <BaseTooltip.Root
      onOpenChange={(open, details) => {
        if (!open && keepOpenOnPress && details.reason === 'trigger-press') {
          details.cancel()
        }
      }}
    >
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={6}>
          <BaseTooltip.Popup className="flex items-center gap-2 rounded-[6px] border border-line bg-panel px-2 py-1 text-[12px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-[opacity,transform] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
            <span>{label}</span>
            {keys.map((key) => (
              <kbd
                key={key}
                className="rounded-[4px] bg-surface-hover px-1 font-sans text-[11px] text-label"
              >
                {key}
              </kbd>
            ))}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}
