import { Loader2 } from 'lucide-react'
import { cn } from '../cn'
import { GENERATIVE_MUTATION_KEY } from '../creative/use-generative'
import { useIsMutating } from '@tanstack/react-query'

export default function Loading() {
  const isMutating = useIsMutating({ mutationKey: [GENERATIVE_MUTATION_KEY] })

  if (!isMutating) {
    return null
  }

  return (
    <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
      <div className="px-2 py-1 bg-neutral-900 rounded-lg flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <div
          className={cn(
            'bg-[linear-gradient(to_right,var(--color-neutral-500)_40%,var(--color-neutral-200)_60%,var(--color-neutral-500)_80%)]',
            'bg-[200%_auto] bg-clip-text font-medium text-transparent',
            'animate-[shimmer_4s_infinite_linear]',
            'text-sm font-semibold',
          )}
        >
          Generating...
        </div>
      </div>
    </div>
  )
}
