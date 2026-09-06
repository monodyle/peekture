import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useState } from 'react'
import ImageStateProvider from './lib/image/state'
import LUTStateProvider from './lib/lut/state'
import persisted from './lib/persisted'
import queryClient from './lib/query-client'
import Screen from './lib/screen'
import { Toaster } from './lib/ui/toast'

export default function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    persisted.init().then(() => setIsReady(true))
  }, [])

  if (!isReady) return null

  return (
    <QueryClientProvider client={queryClient}>
      <Toast.Provider>
        <Tooltip.Provider delay={300}>
          <ImageStateProvider>
            <LUTStateProvider>
              <Screen />
            </LUTStateProvider>
          </ImageStateProvider>
        </Tooltip.Provider>
        <Toaster />
      </Toast.Provider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
