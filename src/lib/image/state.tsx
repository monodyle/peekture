import { createContext, useContext, useState } from 'react'

type ImageState = {
  image: string | null
  setImage: (image: string) => void
}

const ImageState = createContext<ImageState>({
  image: null,
  setImage: () => {},
})

export default function ImageStateProvider({
  children,
}: React.PropsWithChildren) {
  const [image, setImage] = useState<string | null>(null)

  return (
    <ImageState.Provider value={{ image, setImage }}>
      {children}
    </ImageState.Provider>
  )
}

export function useImage() {
  const { image } = useContext(ImageState)
  return image
}

export function useSetImage() {
  const { setImage } = useContext(ImageState)
  return setImage
}
