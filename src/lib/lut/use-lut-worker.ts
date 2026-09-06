import { useCallback, useEffect, useRef } from 'react'
import type { WhiteBalance } from '../white-balance/types'
import type { LUT } from './types'
import type { LUTWorkerRequest, LUTWorkerResponse } from './worker'

type Job = {
  lut: LUT
  intensity: number
  whiteBalance: WhiteBalance
  onDone: (result: ImageData) => void
}

// The worker owns a copy of the source pixels. Each job only sends the LUT,
// intensity and white balance. One job runs at a time and only the latest pending job is
// kept, so a fast slider drag never queues up stale frames.
export function useLUTWorker() {
  const workerRef = useRef<Worker | null>(null)
  const busyRef = useRef(false)
  const pendingRef = useRef<Job | null>(null)
  const activeRef = useRef<Job | null>(null)
  const idRef = useRef(0)

  const flush = useCallback(() => {
    const worker = workerRef.current
    const job = pendingRef.current
    if (!worker || !job || busyRef.current) return

    pendingRef.current = null
    activeRef.current = job
    busyRef.current = true
    idRef.current += 1

    const request: LUTWorkerRequest = {
      type: 'apply',
      id: idRef.current,
      lut: job.lut,
      intensity: job.intensity,
      whiteBalance: job.whiteBalance,
    }
    worker.postMessage(request)
  }, [])

  useEffect(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<LUTWorkerResponse>) => {
      const job = activeRef.current
      busyRef.current = false
      activeRef.current = null
      if (job && event.data.id === idRef.current) {
        job.onDone(
          new ImageData(
            new Uint8ClampedArray(event.data.pixels),
            event.data.width,
            event.data.height,
          ),
        )
      }
      flush()
    }
    workerRef.current = worker

    return () => {
      worker.terminate()
      workerRef.current = null
      busyRef.current = false
      activeRef.current = null
    }
  }, [flush])

  const setSource = useCallback((source: ImageData) => {
    const pixels = source.data.slice().buffer
    const request: LUTWorkerRequest = {
      type: 'source',
      pixels,
      width: source.width,
      height: source.height,
    }
    workerRef.current?.postMessage(request, [pixels])
  }, [])

  const apply = useCallback(
    (job: Job) => {
      pendingRef.current = job
      flush()
    },
    [flush],
  )

  return { setSource, apply }
}
