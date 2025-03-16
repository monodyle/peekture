import ImageUpload from './upload'
import PreviewContainer from '../preview/container'

export default function ImagePanel() {
  return (
    <div className="grid max-h-full overflow-hidden rounded bg-neutral-900 place-items-center">
      <PreviewContainer />
      <ImageUpload />
    </div>
  )
}
