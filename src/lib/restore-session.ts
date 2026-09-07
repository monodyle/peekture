import type { Adjustments } from './adjustments/types'
import { type LoadedImage, loadImage } from './image/load'
import {
  createHistory,
  type Revision,
  type RevisionHistory,
} from './image/revision-state'
import { createDefaultLUT } from './lut/default'
import type { LUT } from './lut/types'
import persisted from './persisted'
import session from './session'

export type RestoredSession = {
  image: LoadedImage | null
  lut: LUT | null
  intensity: number | null
  adjustments: Adjustments | null
  history: RevisionHistory | null
}

async function restoreImage(blob: Blob | null) {
  if (!blob) return null
  try {
    return await loadImage(blob)
  } catch {
    await session.clear()
    return null
  }
}

function findLUT(id: string | null) {
  if (!id) return null
  const defaultLUT = createDefaultLUT()
  if (id === defaultLUT.id) return defaultLUT
  return (
    persisted.read((state) => state.luts.find((lut) => lut.id === id)) ?? null
  )
}

// Sessions saved before revisions existed have an image but no history,
// so the current image becomes the original.
function restoreHistory(
  image: LoadedImage | null,
  revisions: Array<Revision> | null,
  revisionId: string | null,
): RevisionHistory | null {
  if (!image) return null
  if (!revisions || revisions.length === 0) return createHistory(image.source)
  const hasActive = revisions.some((item) => item.id === revisionId)
  return {
    revisions,
    activeId: hasActive ? revisionId : revisions[revisions.length - 1].id,
  }
}

export async function restoreSession(): Promise<RestoredSession> {
  const [blob, lutId, intensity, adjustments, revisions, revisionId] =
    await Promise.all([
      session.read('image'),
      session.read('lutId'),
      session.read('intensity'),
      session.read('adjustments'),
      session.read('revisions'),
      session.read('revisionId'),
    ])
  const image = await restoreImage(blob)
  return {
    image,
    lut: findLUT(lutId),
    intensity,
    adjustments,
    history: restoreHistory(image, revisions, revisionId),
  }
}
