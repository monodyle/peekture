import { ImagePlus, Loader2 } from 'lucide-react'
import type { ChangeEvent, DragEvent } from 'react'
import { useState } from 'react'
import { cn } from '../cn'
import { useIsImageLoading } from './state'
import { IMAGE_ACCEPT, useImageFile } from './use-image-file'

export default function ImageUpload() {
  const handleFile = useImageFile()
  const isLoading = useIsImageLoading()
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
  }

  const handleDrag =
    (dragging: boolean) => (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(dragging)
    }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-panel border border-dashed border-line bg-panel">
        <div className="grid size-12 place-items-center rounded-full bg-surface-hover text-label">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <p className="text-[15px] font-semibold text-white">Loading image...</p>
      </div>
    )
  }

  return (
    <label
      className={cn(
        'flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-panel border border-dashed transition-colors duration-150',
        isDragging
          ? 'border-white/40 bg-surface-hover'
          : 'border-line bg-panel hover:border-white/20 hover:bg-surface',
      )}
      onDragEnter={handleDrag(true)}
      onDragOver={handleDrag(true)}
      onDragLeave={handleDrag(false)}
      onDrop={handleDrop}
    >
      <div className="grid size-12 place-items-center rounded-full bg-surface-hover text-label">
        <ImagePlus className="size-5" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-semibold text-white">Drop an image</p>
        <p className="mt-1 text-[13px] text-muted">
          or click to browse. JPG and PNG.
        </p>
      </div>
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={handleChange}
      />
    </label>
  )
}
