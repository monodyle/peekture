import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { useState } from 'react'
import ImageStateProvider from './lib/image/state'
import LUTStateProvider from './lib/lut/state'
import persisted from './lib/persisted'
import queryClient from './lib/query-client'
import Screen from './lib/screen'

export default function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    persisted.init().then(() => setIsReady(true))
  }, [])

  if (!isReady) return null

  return (
    <QueryClientProvider client={queryClient}>
      <ImageStateProvider>
        <LUTStateProvider>
          <Screen />
        </LUTStateProvider>
      </ImageStateProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
