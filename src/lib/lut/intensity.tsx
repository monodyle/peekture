import { Slider } from '../ui/slider'
import { useIntensity, useSetIntensity } from './state'

export default function LUTIntensity() {
  const intensity = useIntensity()
  const setIntensity = useSetIntensity()

  return (
    <Slider
      label="Intensity"
      value={intensity}
      defaultValue={100}
      onChange={setIntensity}
      min={0}
      max={100}
      step={1}
      unit="%"
    />
  )
}
