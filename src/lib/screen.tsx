import { useImage } from './image/state'
import ImageUpload from './image/upload'
import PreviewContainer from './preview/container'
import Sidebar from './sidebar'

export default function Screen() {
  const image = useImage()

  if (!image) {
    return (
      <div className="grid h-screen p-4 gap-4">
        <ImageUpload />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[auto_300px] h-screen p-4 gap-4">
      <PreviewContainer />
      <Sidebar />
    </div>
  )
}
