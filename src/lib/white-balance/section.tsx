import { SelectControl } from 'dialkit'
import { RotateCcw, Wand2 } from 'lucide-react'
import { useImage } from '../image/state'
import { Section, SectionAction } from '../ui/panel'
import { Slider } from '../ui/slider'
import { useToast } from '../ui/toast'
import { estimateWhiteBalance } from './auto'
import {
  DEFAULT_WHITE_BALANCE,
  isIdentity,
  isPresetMode,
  PRESET_MODES,
  PRESETS,
  presetWhiteBalance,
  RANGE,
} from './presets'
import {
  useAdjustWhiteBalance,
  useResetWhiteBalance,
  useSetWhiteBalance,
  useWhiteBalance,
} from './state'
import type { WhiteBalanceMode } from './types'

const PRESET_OPTIONS = PRESET_MODES.map((mode) => ({
  value: mode,
  label: PRESETS[mode].label,
}))

const CUSTOM_OPTION = { value: 'custom', label: 'Custom' }

function WhiteBalanceActions() {
  const image = useImage()
  const whiteBalance = useWhiteBalance()
  const setWhiteBalance = useSetWhiteBalance()
  const reset = useResetWhiteBalance()
  const toast = useToast()

  const autoAdjust = () => {
    if (!image) return
    const estimate = estimateWhiteBalance(image.thumbnail)
    if (!estimate) {
      toast.add({
        title: 'Auto white balance failed',
        description: 'The image has too little colour to measure.',
      })
      return
    }
    setWhiteBalance(estimate)
  }

  return (
    <>
      <SectionAction label="Auto" onClick={autoAdjust} disabled={!image}>
        <Wand2 className="size-3.5" />
      </SectionAction>
      <SectionAction
        label="Reset"
        onClick={reset}
        disabled={isIdentity(whiteBalance)}
      >
        <RotateCcw className="size-3.5" />
      </SectionAction>
    </>
  )
}

export default function WhiteBalanceSection() {
  const whiteBalance = useWhiteBalance()
  const setWhiteBalance = useSetWhiteBalance()
  const adjust = useAdjustWhiteBalance()

  const options =
    whiteBalance.mode === 'custom'
      ? [...PRESET_OPTIONS, CUSTOM_OPTION]
      : PRESET_OPTIONS

  const selectMode = (value: string) => {
    const mode = value as WhiteBalanceMode
    if (isPresetMode(mode)) setWhiteBalance(presetWhiteBalance(mode))
  }

  return (
    <Section title="White Balance" actions={<WhiteBalanceActions />}>
      <SelectControl
        label="Mode"
        value={whiteBalance.mode}
        options={options}
        onChange={selectMode}
      />
      <Slider
        label="Temperature"
        value={whiteBalance.temperature}
        defaultValue={DEFAULT_WHITE_BALANCE.temperature}
        onChange={(temperature) => adjust({ temperature })}
        min={-RANGE}
        max={RANGE}
        step={1}
      />
      <Slider
        label="Tint"
        value={whiteBalance.tint}
        defaultValue={DEFAULT_WHITE_BALANCE.tint}
        onChange={(tint) => adjust({ tint })}
        min={-RANGE}
        max={RANGE}
        step={1}
      />
    </Section>
  )
}
