import { useCallback, useEffect, useRef } from 'react'
import type { PollingConfig, PollingControls } from './types'
import { usePollingControl } from './usePollingControl'

export const usePolling = <T extends (...args: never[]) => Promise<void>>(
  callback: T,
  timeout: number,
  config: PollingConfig = {}
): PollingControls => {
  const timerIdRef = useRef<ReturnType<typeof window.requestAnimationFrame>>()
  const callbackRef = useRef<T>(callback)
  const pollTimerRef = useRef<number>()

  const { isPausedRef, ...controls } = usePollingControl()

  const { onError } = config
  const interval = timeout < 0 ? 0 : timeout

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const loop = useCallback(
    async (time: number): Promise<void> => {
      if (!pollTimerRef.current) {
        pollTimerRef.current = time
      }
      const elapsed = time - pollTimerRef.current
      if (elapsed >= interval) {
        if (!isPausedRef.current) {
          await callbackRef.current().catch(() => {
            onError?.()
          })
          pollTimerRef.current = undefined
        }
      }
      timerIdRef.current = window.requestAnimationFrame(loop)
    },
    [interval, isPausedRef, onError]
  )

  useEffect(() => {
    timerIdRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (timerIdRef.current) {
        window.cancelAnimationFrame(timerIdRef.current)
      }
    }
  }, [loop])

  return controls
}
