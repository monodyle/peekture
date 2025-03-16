import Histogram from './histogram'
import LUTList from './lut/list'
import LUTUpload from './lut/upload'

export default function Sidebar() {
  return (
    <div className="p-4 rounded bg-neutral-900">
      <div className="space-y-4">
        <Histogram />
        <LUTList />
        <LUTUpload />
      </div>
    </div>
  )
}
