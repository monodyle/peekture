import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../cn'
import {
  type Revision,
  useRemoveRevision,
  useRevisions,
  useSelectRevision,
} from '../image/revision-state'
import { useIsImageLoading } from '../image/state'
import { useLoadImage } from '../image/use-load-image'
import { Tooltip } from '../ui/tooltip'

function useObjectURL(blob: Blob) {
  const [url, setURL] = useState<string | null>(null)
  useEffect(() => {
    const next = URL.createObjectURL(blob)
    setURL(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])
  return url
}

type RevisionRowProps = {
  revision: Revision
  index: number
  active: boolean
  disabled: boolean
  onSelect: () => void
  onRemove: () => void
}

function RevisionRow({
  revision,
  index,
  active,
  disabled,
  onSelect,
  onRemove,
}: RevisionRowProps) {
  const url = useObjectURL(revision.source)
  const isOriginal = revision.prompt === null
  const label = revision.prompt ?? 'Original'

  return (
    <div
      className={cn(
        'group relative rounded-row bg-surface transition-colors duration-150',
        active
          ? 'bg-surface-active ring-1 ring-white/70 ring-inset'
          : 'hover:bg-surface-hover',
      )}
    >
      <button
        type="button"
        title={label}
        disabled={disabled}
        aria-current={active ? 'true' : undefined}
        onClick={onSelect}
        className="flex w-full items-center gap-2.5 p-1.5 text-left disabled:cursor-not-allowed"
      >
        <div className="size-10 shrink-0 overflow-hidden rounded-[5px] bg-black/30">
          {url && (
            <img
              src={url}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'truncate text-[12px] font-medium',
              active ? 'text-white' : 'text-label',
            )}
          >
            {label}
          </div>
          <div className="text-[11px] text-muted">
            {isOriginal ? 'Uploaded' : `Revision ${index}`}
          </div>
        </div>
      </button>
      {!isOriginal && (
        <Tooltip label="Remove">
          <button
            type="button"
            aria-label={`Remove revision ${index}`}
            disabled={disabled}
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-[6px] bg-black/60 text-white/80 opacity-0 transition-opacity duration-150 hover:bg-black/80 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed"
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

export default function CreativeRevisions() {
  const { revisions, activeId } = useRevisions()
  const selectRevision = useSelectRevision()
  const removeRevision = useRemoveRevision()
  const loadImage = useLoadImage()
  const isLoading = useIsImageLoading()

  const handleSelect = async (revision: Revision) => {
    if (revision.id === activeId) return
    if (await loadImage(revision.source, { keepEdits: true })) {
      selectRevision(revision.id)
    }
  }

  // Removing the active revision shows the one before it, so that image
  // must load before the entry goes away.
  const handleRemove = async (revision: Revision) => {
    if (revision.id === activeId) {
      const fallback = revisions[revisions.indexOf(revision) - 1]
      if (!(await loadImage(fallback.source, { keepEdits: true }))) return
    }
    removeRevision(revision.id)
  }

  return (
    <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
      {revisions.map((revision, index) => (
        <RevisionRow
          key={revision.id}
          revision={revision}
          index={index}
          active={revision.id === activeId}
          disabled={isLoading}
          onSelect={() => handleSelect(revision)}
          onRemove={() => handleRemove(revision)}
        />
      ))}
    </div>
  )
}
