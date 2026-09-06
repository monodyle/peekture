import { useCallback } from 'react'
import { useToast } from '../ui/toast'
import { useSetImage } from './state'

export const IMAGE_ACCEPT = 'image/jpg,image/jpeg,image/png'

export function useImageFile() {
  const setImage = useSetImage()
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

      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setImage(reader.result)
      }
      reader.readAsDataURL(file)
    },
    [setImage, toast],
  )
}
