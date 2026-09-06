import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type ImageState = {
  image: string | null
  isLoading: boolean
  setImage: (image: string) => void
  startLoading: () => void
  finishLoading: () => void
}

const ImageState = createContext<ImageState>({
  image: null,
  isLoading: false,
  setImage: () => {},
  startLoading: () => {},
  finishLoading: () => {},
})

export default function ImageStateProvider({
  children,
}: React.PropsWithChildren) {
  const [image, setImageState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // A new image is not ready until the preview has decoded and rendered it,
  // so setting the image also marks it as loading.
  const setImage = useCallback((next: string) => {
    setIsLoading(true)
    setImageState(next)
  }, [])
  const startLoading = useCallback(() => setIsLoading(true), [])
  const finishLoading = useCallback(() => setIsLoading(false), [])

  const value = useMemo<ImageState>(
    () => ({ image, isLoading, setImage, startLoading, finishLoading }),
    [image, isLoading, setImage, startLoading, finishLoading],
  )

  return <ImageState.Provider value={value}>{children}</ImageState.Provider>
}

export function useImage() {
  const { image } = useContext(ImageState)
  return image
}

export function useIsImageLoading() {
  const { isLoading } = useContext(ImageState)
  return isLoading
}

export function useSetImage() {
  const { setImage } = useContext(ImageState)
  return setImage
}

export function useImageLoading() {
  const { startLoading, finishLoading } = useContext(ImageState)
  return { startLoading, finishLoading }
}
