import { Slider } from 'dialkit'
import { useIntensity, useSetIntensity } from './state'

export default function LUTIntensity() {
  const intensity = useIntensity()
  const setIntensity = useSetIntensity()

  return (
    <Slider
      label="Intensity"
      value={intensity}
      onChange={setIntensity}
      min={0}
      max={100}
      step={1}
      unit="%"
    />
  )
}
