import type { Controls } from './usePollingControl'

export type PollingConfig = {
  onError?: () => void
}

export type PollingControls = Omit<Controls, 'isPausedRef'>
