import { createContext, useCallback, useContext, useState } from 'react'

type ImageState = {
  image: string | null
  mimeType: string | null
  setImage: (image: string) => void
  setMimeType: (mimeType: string) => void
}

const ImageState = createContext<ImageState>({
  image: null,
  mimeType: null,
  setImage: () => {},
  setMimeType: () => {},
})

export default function ImageStateProvider({
  children,
}: React.PropsWithChildren) {
  const [image, setImage] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)

  return (
    <ImageState.Provider value={{ image, mimeType, setImage, setMimeType }}>
      {children}
    </ImageState.Provider>
  )
}

export function useImage() {
  const { image, mimeType } = useContext(ImageState)
  return { image, mimeType }
}

export function useSetImage() {
  const { setImage, setMimeType } = useContext(ImageState)
  return useCallback(
    (image: string, mimeType: string) => {
      setImage(image)
      setMimeType(mimeType)
    },
    [setImage, setMimeType],
  )
}
