import { useCallback } from 'react'
import { useToast } from '../ui/toast'
import { useStartRevisions } from './revision-state'
import { useLoadImage } from './use-load-image'

export const IMAGE_ACCEPT = 'image/jpg,image/jpeg,image/png'

export function useImageFile() {
  const loadImage = useLoadImage()
  const toast = useToast()
  const startRevisions = useStartRevisions()

  return useCallback(
    async (file: File | undefined) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        toast.add({
          title: 'Unsupported file',
          description: 'Select a JPG or PNG image.',
        })
        return
      }
      if (await loadImage(file)) startRevisions(file)
    },
    [loadImage, toast, startRevisions],
  )
}
