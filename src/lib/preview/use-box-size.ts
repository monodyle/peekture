import { useEffect, useState } from 'react'

export type Size = { width: number; height: number }

export function useBoxSize(ref: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<Size | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setBox({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return box
}

export function fitRatio(image: Size, box: Size | null) {
  if (!box) return 1
  return Math.min(1, box.width / image.width, box.height / image.height)
}
