import { useState, type FC } from 'react'
import { usePolling } from '../../src'

export const App: FC = () => {
  const [count, setCount] = useState(0)

  const updateCount = async (): Promise<void> => {
    await sleep(100)

    setCount(c => c + 1)
  }

  const { isPaused, pause, resume } = usePolling(updateCount, 1000)

  return (
    <>
      <div>Polling: {isPaused ? 'OFF' : 'ON'}</div>
      <div>Count: {count}</div>
      <button onClick={() => pause()} disabled={isPaused}>
        Pause
      </button>
      <button onClick={() => resume()} disabled={!isPaused}>
        Resume
      </button>
    </>
  )
}

const sleep = (ms: number): Promise<unknown> => new Promise(res => setTimeout(res, ms))
