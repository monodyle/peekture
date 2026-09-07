import { useCallback } from 'react'
import { useResetAdjustments } from '../adjustments/state'
import { useResetEdits } from '../lut/state'
import { useToast } from '../ui/toast'
import {
  ImageTooLargeError,
  loadImage,
  MAX_PIXELS,
  MAX_PREVIEW_SIDE,
} from './load'
import { useImageLoading, useSetImage } from './state'

const MAX_MEGAPIXELS = Math.round(MAX_PIXELS / 1_000_000)

export function useLoadImage() {
  const setImage = useSetImage()
  const { startLoading, finishLoading } = useImageLoading()
  const resetEdits = useResetEdits()
  const resetAdjustments = useResetAdjustments()
  const toast = useToast()

  return useCallback(
    async (source: Blob) => {
      startLoading()
      try {
        const image = await loadImage(source)
        setImage(image)
        resetEdits()
        resetAdjustments()
        if (image.resized) {
          toast.add({
            title: 'Large image',
            description: `Preview was resized to ${MAX_PREVIEW_SIDE} px on the long side.`,
          })
        }
      } catch (error) {
        finishLoading()
        if (error instanceof ImageTooLargeError) {
          toast.add({
            title: 'Image too large',
            description: `Select an image under ${MAX_MEGAPIXELS} megapixels.`,
          })
          return
        }
        toast.add({
          title: 'Could not read file',
          description: 'Try a different image.',
        })
      }
    },
    [
      setImage,
      resetEdits,
      resetAdjustments,
      startLoading,
      finishLoading,
      toast,
    ],
  )
}
