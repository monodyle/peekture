import { useImage } from './state'

export default function Preview() {
  const image = useImage()

  if (!image) return null

  return (
    <div className="w-full h-full flex">
      <img src={image} alt="preview" className="max-w-full max-h-full m-auto" />
    </div>
  )
}
