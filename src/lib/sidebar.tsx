import AdjustmentsSection from './adjustments/section'
import CreativeInput from './creative/input'
import HistogramSection from './histogram'
import ImageReplace from './image/replace'
import LUTIntensity from './lut/intensity'
import LUTList from './lut/list'
import LUTUploadAction from './lut/upload'
import { Panel, Section } from './ui/panel'

export default function Sidebar() {
  return (
    <Panel toolbar={<ImageReplace />}>
      <HistogramSection />
      <AdjustmentsSection />
      <Section title="Filters" actions={<LUTUploadAction />}>
        <LUTIntensity />
        <LUTList />
      </Section>
      <Section title="Creative" defaultOpen={false}>
        <CreativeInput />
      </Section>
    </Panel>
  )
}
