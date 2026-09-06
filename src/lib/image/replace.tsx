import { ImagePlus } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { IMAGE_ACCEPT, useImageFile } from './use-image-file'

export default function ImageReplace() {
  const handleFile = useImageFile()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }

  return (
    <label className="dialkit-button flex w-full cursor-pointer items-center justify-center gap-2">
      <ImagePlus className="size-3.5" />
      <span>Select image</span>
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={handleChange}
      />
    </label>
  )
}
