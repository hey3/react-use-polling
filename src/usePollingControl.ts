import { type MutableRefObject, useCallback, useRef, useState } from 'react'

export type Controls = {
  isPaused: boolean
  isPausedRef: MutableRefObject<boolean>
  pause: () => void
  resume: () => void
}

export const usePollingControl = (): Controls => {
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const isPausedRef = useRef(false)

  const pause = useCallback(() => {
    isPausedRef.current = true
    setIsPaused(true)
  }, [setIsPaused])

  const resume = useCallback(() => {
    isPausedRef.current = false
    setIsPaused(false)
  }, [setIsPaused])

  return {
    isPaused,
    isPausedRef,
    pause,
    resume,
  }
}
