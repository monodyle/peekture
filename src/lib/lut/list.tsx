import { Trash2 } from 'lucide-react'
import { cn } from '../cn'
import { useImage } from '../image/state'
import persisted from '../persisted'
import { Row } from '../ui/panel'
import { createDefaultLUT } from './default'
import LUTPreview from './preview'
import { useLUT, useSetLUT } from './state'
import type { LUT } from './types'
import LUTUpload from './upload'
import { useLUTs } from './use-luts'

const defaultLUT = createDefaultLUT()

type LUTCardProps = {
  lut: LUT
  image: ImageBitmap
  active: boolean
  removable: boolean
  onSelect: () => void
  onRemove: () => void
}

function LUTCard({
  lut,
  image,
  active,
  removable,
  onSelect,
  onRemove,
}: LUTCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-row bg-surface p-1.5 transition-colors duration-150',
        active
          ? 'bg-surface-active ring-1 ring-white/70 ring-inset'
          : 'hover:bg-surface-hover',
      )}
    >
      <button
        type="button"
        className="block w-full cursor-pointer text-left"
        title={lut.name}
        onClick={onSelect}
      >
        <div className="aspect-[5/4] w-full overflow-hidden rounded-[5px] bg-black/30">
          <LUTPreview image={image} lut={lut} />
        </div>
        <div
          className={cn(
            'truncate px-1 pt-1.5 pb-0.5 text-[12px] font-medium',
            active ? 'text-white' : 'text-label',
          )}
        >
          {lut.name}
        </div>
      </button>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${lut.name}`}
          className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-[6px] bg-black/60 text-white/80 opacity-0 transition-opacity duration-150 hover:bg-black/80 hover:text-white group-hover:opacity-100"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export default function LUTList() {
  const image = useImage()
  const { data: luts, refetch } = useLUTs()
  const setLUT = useSetLUT()
  const currentLUT = useLUT()

  const removeLUT = async (lut: LUT) => {
    await persisted.write((draft) => {
      draft.luts = draft.luts.filter((item) => item.id !== lut.id)
    })
    if (currentLUT.id === lut.id) setLUT(defaultLUT)
    await refetch()
  }

  return (
    <>
      <Row label="Cube files">
        <LUTUpload />
      </Row>
      {image && (
        <div className="grid grid-cols-2 gap-1.5">
          {[defaultLUT, ...(luts ?? [])].map((lut) => (
            <LUTCard
              key={lut.id}
              lut={lut}
              image={image.thumbnail}
              active={currentLUT.id === lut.id}
              removable={lut.id !== defaultLUT.id}
              onSelect={() => setLUT(lut)}
              onRemove={() => removeLUT(lut)}
            />
          ))}
        </div>
      )}
    </>
  )
}
