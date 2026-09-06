import { AnimatePresence, motion, type Transition } from 'motion/react'
import { type ReactNode, useState } from 'react'
import { cn } from '../cn'
import { Tooltip } from './tooltip'

type PanelProps = {
  toolbar?: ReactNode
  children: ReactNode
}

export function Panel({ toolbar, children }: PanelProps) {
  return (
    <div
      className="peekture-panel dialkit-root overflow-hidden rounded-panel border border-line bg-panel"
      data-theme="dark"
      data-mode="inline"
    >
      <div className="dialkit-panel-inner dialkit-panel-inline">
        <div className="dialkit-folder dialkit-folder-root">
          {toolbar && <div className="dialkit-panel-toolbar">{toolbar}</div>}
          <div className="dialkit-folder-inner">{children}</div>
        </div>
      </div>
    </div>
  )
}

type SectionProps = {
  title: string
  defaultOpen?: boolean
  actions?: ReactNode
  children: ReactNode
}

const CHEVRON = 'M6 9.5L12 15.5L18 9.5'
const FOLD_TRANSITION: Transition = {
  type: 'spring',
  visualDuration: 0.35,
  bounce: 0.1,
}

// dialkit's Folder only renders a toolbar on the root panel, so this is a
// copy of its non-root folder with an actions slot in the header.
export function Section({
  title,
  defaultOpen = true,
  actions,
  children,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="dialkit-folder" data-open={String(isOpen)}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: mirrors dialkit's folder header */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: mirrors dialkit's folder header */}
      <div
        className="dialkit-folder-header"
        onClick={() => setIsOpen((open) => !open)}
      >
        <div className="dialkit-folder-header-top">
          <div className="dialkit-folder-title-row">
            <span className="dialkit-folder-title">{title}</span>
          </div>
          {actions && isOpen && (
            // biome-ignore lint/a11y/noStaticElementInteractions: keeps action clicks from toggling the section
            // biome-ignore lint/a11y/useKeyWithClickEvents: keeps action clicks from toggling the section
            <div
              className="flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          )}
          <motion.svg
            className="dialkit-folder-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.15 }}
          >
            <path d={CHEVRON} />
          </motion.svg>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="dialkit-folder-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={FOLD_TRANSITION}
            style={{ clipPath: 'inset(0 -20px)' }}
          >
            <div className="dialkit-folder-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type SectionActionProps = {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}

export function SectionAction({
  label,
  onClick,
  disabled,
  children,
}: SectionActionProps) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className="grid size-5 place-items-center rounded-[4px] text-label transition-colors duration-150 hover:bg-surface-hover hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-label"
      >
        {children}
      </button>
    </Tooltip>
  )
}

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function ActionButton({ className, ...props }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn('dialkit-button', className)}
      {...props}
    />
  )
}
