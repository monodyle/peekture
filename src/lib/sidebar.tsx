import CreativeInput from './creative/input'
import Histogram from './histogram'
import LUTList from './lut/list'

export default function Sidebar() {
  return (
    <div className="p-4 rounded bg-neutral-900 h-full overflow-hidden flex flex-col">
      <div className="space-y-4 flex-1 flex flex-col overflow-hidden h-full">
        <Histogram />
        <CreativeInput />
        <LUTList />
      </div>
    </div>
  )
}
