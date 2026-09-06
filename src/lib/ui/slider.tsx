import { Slider as DialkitSlider } from 'dialkit'
import { type ComponentProps, useState } from 'react'

type SliderProps = ComponentProps<typeof DialkitSlider> & {
  defaultValue: number
}

export function Slider({ defaultValue, onChange, ...props }: SliderProps) {
  const [resetCount, setResetCount] = useState(0)

  const reset = () => {
    onChange(defaultValue)
    // dialkit ignores prop updates while its click animation runs,
    // so remount to sync the visual position
    setResetCount((count) => count + 1)
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: double-click reset is a mouse-only shortcut, the slider itself stays accessible
    <div onDoubleClick={reset}>
      <DialkitSlider key={resetCount} onChange={onChange} {...props} />
    </div>
  )
}
