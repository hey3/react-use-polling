import { useCallback, useEffect, useRef } from 'react'
import type { PollingConfig, PollingControls } from './types'
import { usePollingControl } from './usePollingControl'

export const usePollingForce = <T extends (...args: never[]) => Promise<void>>(
  callback: T,
  timeout: number,
  config: PollingConfig = {}
): PollingControls => {
  const timerIdRef = useRef<number>()
  const callbackRef = useRef<T>(callback)

  const { isPausedRef, ...controls } = usePollingControl()

  const { onError } = config
  const interval = timeout < 0 ? 0 : timeout

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const loop = useCallback(async () => {
    if (!isPausedRef.current) {
      await callbackRef.current().catch(() => {
        onError?.()
      })
    }
  }, [isPausedRef, onError])

  useEffect(() => {
    timerIdRef.current = window.setInterval(loop, interval)

    return () => {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current)
      }
    }
  }, [interval, loop])

  return controls
}
