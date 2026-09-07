import { Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { useRef, useState } from 'react'
import { Tooltip } from '../ui/tooltip'
import CreativeInput from './input'

const PANEL_TRANSITION = {
  type: 'spring',
  visualDuration: 0.3,
  bounce: 0.15,
} as const

export default function CreativeFloating() {
  const [expanded, setExpanded] = useState(false)
  const boundsRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  return (
    <div ref={boundsRef} className="pointer-events-none fixed inset-0 z-50">
      <motion.div
        className="pointer-events-auto absolute right-[356px] bottom-4"
        drag
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={boundsRef}
        dragElastic={0.05}
        dragMomentum={false}
      >
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.div
              key="panel"
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
                onPointerDown={(e) => dragControls.start(e)}
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
              <div className="dialkit-folder-inner px-3 pt-3 pb-3">
                <CreativeInput />
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              type="button"
              aria-label="Open Creative"
              className="grid size-11 cursor-grab touch-none place-items-center rounded-full border border-line bg-panel text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-colors hover:bg-surface-hover active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
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
