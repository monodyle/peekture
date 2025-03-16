import LUTList from './lut/list'
import LUTUpload from './lut/upload'

export default function Sidebar() {
  return (
    <div className="p-4 rounded bg-neutral-900">
      <div className="space-y-4">
        <p className="text-xs font-semibold tracking-tight uppercase text-neutral-500">
          Filters
        </p>
        <LUTList />
        <LUTUpload />
      </div>
    </div>
  )
}
