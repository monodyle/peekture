import { HardDriveUpload } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { useImage, useSetImage } from './state'
import { cn } from '../cn'

export default function ImageUpload() {
  const image = useImage()
  const setImage = useSetImage()
  const [isDragging, setIsDragging] = useState(false)

  if (image) return null

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleFile(file)
  }

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return
    handleFile(file)
  }

  return (
    <div className="w-full h-full">
      <label
        className={cn(
          'flex flex-col items-center justify-center gap-4 p-24 transition-colors duration-100 border-1 w-full h-full border-dashed rounded cursor-pointer text-neutral-400',
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-neutral-700 hover:border-neutral-600',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-2">
          <HardDriveUpload className="size-4" />
          Upload your image here to start
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
    </div>
  )
}
