import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useState } from 'react'
import AdjustmentsStateProvider from './lib/adjustments/state'
import ImageStateProvider from './lib/image/state'
import LUTStateProvider from './lib/lut/state'
import persisted from './lib/persisted'
import queryClient from './lib/query-client'
import { type RestoredSession, restoreSession } from './lib/restore-session'
import Screen from './lib/screen'
import { Toaster } from './lib/ui/toast'

export default function App() {
  const [restored, setRestored] = useState<RestoredSession | null>(null)

  useEffect(() => {
    persisted.init().then(restoreSession).then(setRestored)
  }, [])

  if (!restored) return null

  return (
    <QueryClientProvider client={queryClient}>
      <Toast.Provider>
        <Tooltip.Provider delay={300}>
          <ImageStateProvider initialImage={restored.image}>
            <LUTStateProvider
              initialLUT={restored.lut}
              initialIntensity={restored.intensity}
            >
              <AdjustmentsStateProvider
                initialAdjustments={restored.adjustments}
              >
                <Screen />
              </AdjustmentsStateProvider>
            </LUTStateProvider>
          </ImageStateProvider>
        </Tooltip.Provider>
        <Toaster />
      </Toast.Provider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
