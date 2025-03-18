import { CloudUpload, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { cn } from '../cn'
import persisted from '../persisted'
import { useLUTs } from './use-luts'
import type { LUT } from './types'
import { nanoid } from 'nanoid'

export default function LUTUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { refetch: refetchLUTs } = useLUTs()

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return
      setIsUploading(true)
      const luts: Array<LUT> = []
      for (const file of Array.from(files)) {
        const data = await file.text()
        luts.push({
          id: nanoid(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          data,
        })
      }

      persisted.write((draft) => {
        draft.luts.push(...luts)
      })

      await refetchLUTs()
      setIsUploading(false)
    },
    [refetchLUTs],
  )

  return (
    <label
      className={cn(
        'flex items-center gap-1 border rounded',
        'px-1 py-0.5 text-xs font-semibold tracking-tight text-neutral-500',
        'transition-colors duration-100',
        isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-transparent bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-200',
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        accept=".cube"
        multiple
        disabled={isUploading}
        onChange={handleChange}
      />
      {isUploading ? (
        <>
          <Loader2 className="size-3 animate-spin" />
          <span>Uploading...</span>
        </>
      ) : (
        <>
          <CloudUpload className="size-3" />
          <span>Upload</span>
        </>
      )}
    </label>
  )
}
