import { RotateCcw, Wand2 } from 'lucide-react'
import { Fragment } from 'react'
import { useImage } from '../image/state'
import { Section, SectionAction } from '../ui/panel'
import { Slider } from '../ui/slider'
import { useToast } from '../ui/toast'
import { estimateWhiteBalance } from './auto'
import { GROUPS, isIdentity, RANGES } from './defaults'
import { useAdjust, useAdjustments, useResetAdjustments } from './state'

function AdjustmentsActions() {
  const image = useImage()
  const adjustments = useAdjustments()
  const adjust = useAdjust()
  const reset = useResetAdjustments()
  const toast = useToast()

  const autoBalance = () => {
    if (!image) return
    const estimate = estimateWhiteBalance(image.thumbnail)
    if (!estimate) {
      toast.add({
        title: 'Auto white balance failed',
        description: 'The image has too little colour to measure.',
      })
      return
    }
    adjust(estimate)
  }

  return (
    <>
      <SectionAction label="Auto" onClick={autoBalance} disabled={!image}>
        <Wand2 className="size-3.5" />
      </SectionAction>
      <SectionAction
        label="Reset"
        onClick={reset}
        disabled={isIdentity(adjustments)}
      >
        <RotateCcw className="size-3.5" />
      </SectionAction>
    </>
  )
}

function Divider() {
  return <div className="my-1 border-t border-line-subtle" />
}

export default function AdjustmentsSection() {
  const adjustments = useAdjustments()
  const adjust = useAdjust()

  return (
    <Section title="Adjustments" actions={<AdjustmentsActions />}>
      {GROUPS.map((keys, index) => (
        <Fragment key={keys[0]}>
          {index > 0 && <Divider />}
          {keys.map((key) => (
            <Slider
              key={key}
              label={RANGES[key].label}
              value={adjustments[key]}
              defaultValue={RANGES[key].default}
              onChange={(value) => adjust({ [key]: value })}
              min={RANGES[key].min}
              max={RANGES[key].max}
              step={RANGES[key].step}
            />
          ))}
        </Fragment>
      ))}
    </Section>
  )
}
