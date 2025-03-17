import Histogram from './histogram'
import LUTList from './lut/list'

export default function Sidebar() {
  return (
    <div className="p-4 rounded bg-neutral-900">
      <div className="space-y-4">
        <Histogram />
        <LUTList />
      </div>
    </div>
  )
}
