import { Toast } from '@base-ui/react/toast'
import { X } from 'lucide-react'
import { cn } from '../cn'

export function useToast() {
  return Toast.useToastManager()
}

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={cn(
        'absolute right-0 bottom-0 w-full select-none',
        '[--gap:0.5rem] [--peek:0.5rem]',
        '[--scale:calc(max(0,1-(var(--toast-index)*0.08)))]',
        '[--shrink:calc(1-var(--scale))]',
        '[--height:var(--toast-frontmost-height,var(--toast-height))]',
        '[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]',
        'z-[calc(1000-var(--toast-index))] origin-bottom',
        'h-(--height) data-expanded:h-(--toast-height)',
        '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]',
        'data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        'data-starting-style:[transform:translateY(150%)]',
        '[&[data-ending-style]:not([data-limited])]:[transform:translateY(150%)]',
        'data-ending-style:opacity-0 data-limited:opacity-0',
        '[transition:transform_0.4s_cubic-bezier(0.22,1,0.36,1),opacity_0.3s,height_0.15s]',
        'rounded-panel border border-line bg-panel shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        'after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[""]',
      )}
    >
      <Toast.Content className="flex items-start gap-3 overflow-hidden p-3 transition-opacity duration-200 data-behind:opacity-0 data-expanded:opacity-100">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Toast.Title className="text-[13px] font-semibold text-white" />
          <Toast.Description className="text-[12px] text-label" />
        </div>
        <Toast.Close
          aria-label="Dismiss"
          className="grid size-6 shrink-0 place-items-center rounded-[6px] text-muted hover:bg-surface-hover hover:text-white"
        >
          <X className="size-3.5" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ))
}

export function Toaster() {
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed right-4 bottom-4 z-50 w-80">
        <ToastList />
      </Toast.Viewport>
    </Toast.Portal>
  )
}
