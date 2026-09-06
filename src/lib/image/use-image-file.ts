import { useCallback } from 'react'
import { useToast } from '../ui/toast'
import { useLoadImage } from './use-load-image'

export const IMAGE_ACCEPT = 'image/jpg,image/jpeg,image/png'

export function useImageFile() {
  const loadImage = useLoadImage()
  const toast = useToast()

  return useCallback(
    (file: File | undefined) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        toast.add({
          title: 'Unsupported file',
          description: 'Select a JPG or PNG image.',
        })
        return
      }
      loadImage(file)
    },
    [loadImage, toast],
  )
}
