import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useState } from 'react'
import ImagePanel from './lib/image/panel'
import ImageStateProvider from './lib/image/state'
import persisted from './lib/persisted'
import { queryClient } from './lib/query-client'
import Sidebar from './lib/sidebar'

export default function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    persisted.init()
    setIsReady(true)
  }, [])

  if (!isReady) return null

  return (
    <QueryClientProvider client={queryClient}>
      <ImageStateProvider>
        <div className="grid grid-cols-[auto_300px] min-h-screen p-4 gap-4">
          <ImagePanel />
          <Sidebar />
        </div>
      </ImageStateProvider>
    </QueryClientProvider>
  )
}
