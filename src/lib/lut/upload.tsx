import { Loader2, Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useCallback, useRef, useState } from 'react'
import persisted from '../persisted'
import { SectionAction } from '../ui/panel'
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

function useLUTUpload() {
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

  return { isUploading, handleChange }
}

const FILE_INPUT_PROPS = {
  type: 'file',
  className: 'hidden',
  accept: '.cube',
  multiple: true,
} as const

export default function LUTUploadAction() {
  const { isUploading, handleChange } = useLUTUpload()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        {...FILE_INPUT_PROPS}
        ref={inputRef}
        disabled={isUploading}
        onChange={handleChange}
      />
      <SectionAction
        label="Add .cube"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Plus className="size-3.5" />
        )}
      </SectionAction>
    </>
  )
}
