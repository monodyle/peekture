import { useCallback } from 'react'
import { useToast } from '../ui/toast'
import { loadImage } from './load'
import { useImageLoading, useSetImage } from './state'

export function useLoadImage() {
  const setImage = useSetImage()
  const { startLoading, finishLoading } = useImageLoading()
  const toast = useToast()

  return useCallback(
    async (source: Blob) => {
      startLoading()
      try {
        setImage(await loadImage(source))
      } catch {
        finishLoading()
        toast.add({
          title: 'Could not read file',
          description: 'Try a different image.',
        })
      }
    },
    [setImage, startLoading, finishLoading, toast],
  )
}
