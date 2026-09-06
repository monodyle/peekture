import { RotateCcw, Wand2 } from 'lucide-react'
import { useImage } from '../image/state'
import { Section, SectionAction } from '../ui/panel'
import { Slider } from '../ui/slider'
import { useToast } from '../ui/toast'
import { estimateExposure } from './auto'
import { DEFAULT_EXPOSURE, isIdentity, RANGE } from './defaults'
import {
  useAdjustExposure,
  useExposure,
  useResetExposure,
  useSetExposure,
} from './state'
import type { ExposureKey } from './types'

const SLIDERS: Array<{ key: ExposureKey; label: string }> = [
  { key: 'exposure', label: 'Exposure' },
  { key: 'contrast', label: 'Contrast' },
  { key: 'brightness', label: 'Brightness' },
  { key: 'saturation', label: 'Saturation' },
]

function ExposureActions() {
  const image = useImage()
  const exposure = useExposure()
  const setExposure = useSetExposure()
  const reset = useResetExposure()
  const toast = useToast()

  const autoAdjust = () => {
    if (!image) return
    const estimate = estimateExposure(image.thumbnail)
    if (!estimate) {
      toast.add({
        title: 'Auto exposure failed',
        description: 'The image has too little tone to measure.',
      })
      return
    }
    setExposure(estimate)
  }

  return (
    <>
      <SectionAction label="Auto" onClick={autoAdjust} disabled={!image}>
        <Wand2 className="size-3.5" />
      </SectionAction>
      <SectionAction
        label="Reset"
        onClick={reset}
        disabled={isIdentity(exposure)}
      >
        <RotateCcw className="size-3.5" />
      </SectionAction>
    </>
  )
}

export default function ExposureSection() {
  const exposure = useExposure()
  const adjust = useAdjustExposure()

  return (
    <Section title="Exposure" actions={<ExposureActions />}>
      {SLIDERS.map(({ key, label }) => (
        <Slider
          key={key}
          label={label}
          value={exposure[key]}
          defaultValue={DEFAULT_EXPOSURE[key]}
          onChange={(value) => adjust({ [key]: value })}
          min={-RANGE}
          max={RANGE}
          step={1}
        />
      ))}
    </Section>
  )
}
