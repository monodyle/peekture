import { Loader2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { cn } from '../cn'
import persisted from '../persisted'
import { useLUTs } from './get-all-lut'
import type { LUT } from './types'
import codec from '../codec'
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
        const arrayBuffer = await file.arrayBuffer()
        const data = codec.encode(arrayBuffer)
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
    <div>
      <label
        className={cn(
          'flex items-center gap-2 p-2 border rounded cursor-pointer',
          'transition-colors duration-100',
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-transparent bg-neutral-800',
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
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 text-neutral-500 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <>
            <Upload className="size-4 text-neutral-500" />
            <span className="text-sm">Add new filter</span>
          </>
        )}
      </label>
    </div>
  )
}
