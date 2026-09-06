import CreativeInput from './creative/input'
import Histogram from './histogram'
import ImageReplace from './image/replace'
import LUTIntensity from './lut/intensity'
import LUTList from './lut/list'
import LUTUploadAction from './lut/upload'
import { Panel, Section } from './ui/panel'
import WhiteBalanceSection from './white-balance/section'

export default function Sidebar() {
  return (
    <Panel toolbar={<ImageReplace />}>
      <Section title="Histogram">
        <Histogram />
      </Section>
      <WhiteBalanceSection />
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
