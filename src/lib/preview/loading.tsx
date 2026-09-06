import { useIsMutating } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { cn } from '../cn'
import { GENERATIVE_MUTATION_KEY } from '../creative/use-generative'
import { useIsImageLoading } from '../image/state'

export default function Loading() {
  const isMutating = useIsMutating({ mutationKey: [GENERATIVE_MUTATION_KEY] })
  const isImageLoading = useIsImageLoading()

  if (!isMutating && !isImageLoading) {
    return null
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-app/70 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 rounded-[10px] border border-line bg-panel px-3.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <Loader2 className="size-4 animate-spin text-label" />
        <div
          className={cn(
            'bg-[linear-gradient(to_right,var(--color-muted)_40%,white_60%,var(--color-muted)_80%)]',
            'bg-[200%_auto] bg-clip-text text-transparent',
            'animate-[shimmer_3s_infinite_linear]',
            'text-[13px] font-semibold',
          )}
        >
          {isMutating ? 'Generating...' : 'Loading image...'}
        </div>
      </div>
    </div>
  )
}
