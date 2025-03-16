import ImagePanel from './lib/image/panel'
import ImageStateProvider from './lib/image/state'
import Sidebar from './lib/sidebar'

export default function App() {
  return (
    <ImageStateProvider>
      <div className="grid grid-cols-[auto_300px] min-h-screen p-4 gap-4">
        <ImagePanel />
        <Sidebar />
      </div>
    </ImageStateProvider>
  )
}
