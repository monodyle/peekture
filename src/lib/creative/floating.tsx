import { Sparkles, X } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
} from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { useRevisions } from '../image/revision-state'
import { Section } from '../ui/panel'
import { Tooltip } from '../ui/tooltip'
import CreativeInput from './input'
import CreativeRevisions from './revisions'

type DragConstraints = {
  left: number
  right: number
  top: number
  bottom: number
}

const PANEL_TRANSITION = {
  type: 'spring',
  visualDuration: 0.3,
  bounce: 0.15,
} as const

export default function CreativeFloating() {
  const [expanded, setExpanded] = useState(false)
  const boundsRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [anchor, setAnchor] = useState<{ top?: number; bottom?: number }>({
    bottom: 16,
  })
  const [constraints, setConstraints] = useState<DragConstraints>()
  const { revisions } = useRevisions()

  // Numeric constraints instead of a ref: with a ref, motion rescales the
  // drag offset whenever the panel resizes, which moves the top edge.
  const startDrag = (e: React.PointerEvent) => {
    const bounds = boundsRef.current?.getBoundingClientRect()
    const rect = e.currentTarget.parentElement?.getBoundingClientRect()
    if (bounds && rect) {
      const dx = x.get()
      const dy = y.get()
      setConstraints({
        left: bounds.left - rect.left + dx,
        right: bounds.right - rect.right + dx,
        top: bounds.top - rect.top + dy,
        bottom: bounds.bottom - rect.bottom + dy,
      })
    }
    dragControls.start(e)
  }

  // The collapsed button hangs from the bottom edge. While the panel is open
  // the wrapper is pinned by its top edge instead, so a taller panel grows
  // downward. The switch keeps the visual position by subtracting the drag
  // offset from the measured rect. A callback ref is used because the panel
  // mounts only after the button finishes its exit animation.
  const anchorPanel = useCallback(
    (panel: HTMLDivElement) => {
      setAnchor({ top: panel.getBoundingClientRect().top - y.get() })
      return () => {
        const bottom = panel.getBoundingClientRect().bottom - y.get()
        setAnchor({ bottom: window.innerHeight - bottom })
      }
    },
    [y],
  )

  return (
    <div ref={boundsRef} className="pointer-events-none fixed inset-0 z-50">
      <motion.div
        className="pointer-events-auto absolute right-[356px]"
        drag
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={constraints}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x, y, ...anchor }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.div
              key="panel"
              ref={anchorPanel}
              className="peekture-panel dialkit-root w-[320px] overflow-hidden rounded-panel border border-line bg-panel shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              data-theme="dark"
              data-mode="inline"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={PANEL_TRANSITION}
              style={{ transformOrigin: 'bottom right' }}
            >
              <div
                className="flex cursor-grab touch-none select-none items-center gap-2 border-line-subtle border-b px-3 py-2.5 active:cursor-grabbing"
                onPointerDown={startDrag}
              >
                <Sparkles className="size-3.5 text-label" />
                <span className="flex-1 font-semibold text-[13px] text-white">
                  Creative
                </span>
                <Tooltip label="Collapse">
                  <button
                    type="button"
                    aria-label="Collapse"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setExpanded(false)}
                    className="grid size-6 place-items-center rounded-[6px] text-muted transition-colors hover:bg-surface-hover hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </Tooltip>
              </div>
              <div className="px-3 pt-3 pb-3">
                <div className="dialkit-folder-inner">
                  <CreativeInput />
                </div>
                {revisions.length > 0 && (
                  <div className="mt-3">
                    <Section title="Revisions">
                      <CreativeRevisions />
                    </Section>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              type="button"
              aria-label="Open Creative"
              className="grid size-11 cursor-grab touch-none place-items-center rounded-full border border-line bg-panel text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-colors hover:bg-surface-hover active:cursor-grabbing"
              onPointerDown={startDrag}
              onTap={() => setExpanded(true)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileTap={{ scale: 0.95 }}
              transition={PANEL_TRANSITION}
            >
              <Sparkles className="size-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
