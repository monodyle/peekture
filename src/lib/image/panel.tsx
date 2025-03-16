import ImageUpload from './upload'
import ImagePreview from './preview'

export default function ImagePanel() {
  return (
    <div className="grid p-4 rounded bg-neutral-900 place-items-center">
      <ImagePreview />
      <ImageUpload />
    </div>
  )
}
