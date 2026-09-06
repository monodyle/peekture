import CreativeInput from './creative/input'
import Histogram from './histogram'
import ImageReplace from './image/replace'
import LUTList from './lut/list'
import { Panel, Section } from './ui/panel'

export default function Sidebar() {
  return (
    <Panel toolbar={<ImageReplace />}>
      <Section title="Histogram">
        <Histogram />
      </Section>
      <Section title="Filters">
        <LUTList />
      </Section>
      <Section title="Creative" defaultOpen={false}>
        <CreativeInput />
      </Section>
    </Panel>
  )
}
