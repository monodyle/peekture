import LUTPreview from './preview'
import { useImage } from '../image/state'
import { useLUTs } from './get-all-lut'
import { useSetLUT, useLUT } from './state'
import { createDefaultLUT } from './default'
import { cn } from '../cn'

const defaultLUT = createDefaultLUT()

export default function LUTList() {
  const image = useImage()
  const { data: luts, isFetching } = useLUTs()
  const setLUT = useSetLUT()
  const currentLUT = useLUT()

  if (isFetching) {
    return (
      <div className="text-sm text-center text-neutral-500">Loading...</div>
    )
  }

  if (!luts || luts.length === 0) {
    return (
      <div className="text-sm text-center text-neutral-500">No LUTs found</div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-tight uppercase text-neutral-500">
        Filters
      </p>
      <div className="grid grid-cols-2 gap-2 p-2 -mx-2">
        {[defaultLUT, ...luts].map((lut) => (
          <button
            key={lut.id}
            type="button"
            className={cn(
              'w-full text-left space-y-1.5 cursor-pointer rounded',
              currentLUT?.id === lut.id && 'bg-neutral-800',
            )}
            title={lut.name}
            onClick={() => setLUT(lut)}
          >
            <div className="aspect-[5/4] w-full bg-neutral-800 overflow-hidden rounded">
              {image && <LUTPreview image={image} lut={lut} />}
            </div>
            <div className="text-xs truncate px-2 pb-1">{lut.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
