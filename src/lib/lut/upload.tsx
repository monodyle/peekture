import { Loader2, Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useCallback, useState } from 'react'
import { cn } from '../cn'
import persisted from '../persisted'
import { useToast } from '../ui/toast'
import type { LUT } from './types'
import { useLUTs } from './use-luts'

async function readLUTs(files: FileList) {
  const luts: Array<LUT> = []
  for (const file of Array.from(files)) {
    luts.push({
      id: nanoid(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      data: await file.text(),
    })
  }
  return luts
}

export default function LUTUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const { refetch: refetchLUTs } = useLUTs()
  const toast = useToast()

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return
      setIsUploading(true)
      const luts = await readLUTs(files)
      await persisted.write((draft) => {
        draft.luts.push(...luts)
      })
      await refetchLUTs()
      setIsUploading(false)
      e.target.value = ''
      toast.add({
        title:
          luts.length === 1 ? 'Filter added' : `${luts.length} filters added`,
      })
    },
    [refetchLUTs, toast],
  )

  return (
    <label
      className={cn(
        'flex h-7 cursor-pointer items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-medium text-label',
        'bg-surface-hover transition-colors duration-150 hover:bg-surface-active hover:text-white',
        isUploading && 'pointer-events-none text-muted',
      )}
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
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Plus className="size-3.5" />
      )}
      <span>Add .cube</span>
    </label>
  )
}
