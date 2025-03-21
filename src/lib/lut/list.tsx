import { cn } from '../cn'
import { useImage } from '../image/state'
import { createDefaultLUT } from './default'
import { useLUTs } from './use-luts'
import LUTPreview from './preview'
import { useLUT, useSetLUT } from './state'
import LUTUpload from './upload'

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

  return (
    <div className="gap-2 flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between sticky top-0 bg-neutral-900 z-10 py-1">
        <div className="text-xs font-semibold tracking-tight uppercase text-neutral-500">
          Filters
        </div>
        <LUTUpload />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 p-2 flex-1">
          {[defaultLUT, ...(luts ?? [])].map((lut) => (
            <button
              key={lut.id}
              type="button"
              className={cn(
                'w-full text-left space-y-0.5 cursor-pointer rounded',
                currentLUT.id === lut.id &&
                  'bg-neutral-800 outline-2 outline-blue-500',
              )}
              title={lut.name}
              onClick={() => setLUT(lut)}
            >
              <div className="p-1">
                <div className="aspect-[5/4] w-full overflow-hidden rounded">
                  {image && <LUTPreview image={image} lut={lut} />}
                </div>
              </div>
              <div className="text-xs truncate px-2 pb-1">{lut.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
