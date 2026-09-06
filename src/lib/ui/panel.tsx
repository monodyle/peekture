import { Folder } from 'dialkit'
import type { ReactNode } from 'react'
import { cn } from '../cn'

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
  children: ReactNode
}

export function Section({ title, defaultOpen = true, children }: SectionProps) {
  return (
    <Folder title={title} defaultOpen={defaultOpen}>
      {children}
    </Folder>
  )
}

type RowProps = {
  label: ReactNode
  children?: ReactNode
  className?: string
}

export function Row({ label, children, className }: RowProps) {
  return (
    <div className={cn('dialkit-labeled-control', className)}>
      <span className="dialkit-labeled-control-label">{label}</span>
      {children}
    </div>
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
