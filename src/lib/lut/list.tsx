import { useLUTs } from './get-all-lut'

export default function LUTList() {
  const { data: luts, isFetching } = useLUTs()

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
    <div className="grid grid-cols-2 gap-2 overflow-y-auto">
      {luts.map((lut) => (
        <div key={lut.id} className="space-y-2" title={lut.name}>
          <div className="aspect-[5/4] w-full bg-neutral-800 rounded" />
          <div className="text-sm truncate">{lut.name}</div>
        </div>
      ))}
    </div>
  )
}
