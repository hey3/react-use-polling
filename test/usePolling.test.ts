import { act, renderHook } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { usePolling } from '../src/usePolling'
import { mockAnimationFrame } from './mockAnimationFrame'

describe('usePolling', () => {
  beforeAll(() => {
    mockAnimationFrame.mock()
  })

  afterAll(() => {
    mockAnimationFrame.restore()
  })

  it('should run automatically on render.', () => {
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePolling(mockFn, 1000))

    expect(result.current.isPaused).toBeFalsy()
  })

  it('should bew paused by executing pause().', () => {
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePolling(mockFn, 1000))

    act(() => {
      result.current.pause()
    })

    expect(result.current.isPaused).toBeTruthy()
  })

  it('should be resumed by executing resume() during pause.', () => {
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePolling(mockFn, 1000))

    act(() => {
      result.current.pause()
    })
    expect(result.current.isPaused).toBeTruthy()

    act(() => {
      result.current.resume()
    })
    expect(result.current.isPaused).toBeFalsy()
  })

  it('should not execute callback right after render.', () => {
    const mockFn = vi.fn(() => Promise.resolve())
    renderHook(() => usePolling(mockFn, 1000))

    expect(mockFn).not.toBeCalled()
  })

  it('should execute the callback after the specified timeout.', async () => {
    const INTERVAL = 1
    vi.useFakeTimers()
    const mockFn = vi.fn(() => Promise.resolve())
    renderHook(() => usePolling(mockFn, INTERVAL))

    const interval = async (): Promise<void> => {
      await act(async () => {
        await mockAnimationFrame.runFrame()
        vi.advanceTimersByTime(INTERVAL)
      })
    }

    for (let i = 1; i < 10; i++) {
      await interval()
      await act(async () => {
        await mockAnimationFrame.runFrame()
        vi.advanceTimersByTime(INTERVAL)
      })
      expect(mockFn).toHaveBeenCalledTimes(i)
    }
  })

  it('should not execute the callback if it is paused.', async () => {
    const INTERVAL = 1
    vi.useFakeTimers()
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePolling(mockFn, INTERVAL))

    act(() => {
      result.current.pause()
    })

    const interval = async (): Promise<void> => {
      await act(async () => {
        await mockAnimationFrame.runFrame()
        vi.advanceTimersByTime(INTERVAL)
      })
    }

    for (let i = 1; i < 5; i++) {
      await interval()
      await act(async () => {
        await mockAnimationFrame.runFrame()
        vi.advanceTimersByTime(INTERVAL)
      })
      expect(mockFn).toHaveBeenCalledTimes(0)
    }

    act(() => {
      result.current.resume()
    })

    for (let i = 1; i < 5; i++) {
      await interval()
      await act(async () => {
        await mockAnimationFrame.runFrame()
        vi.advanceTimersByTime(INTERVAL)
      })
      expect(mockFn).toHaveBeenCalledTimes(i)
    }
  })

  it('should run onError() on error in callback.', async () => {
    const INTERVAL = 1
    vi.useFakeTimers()
    const mockFn = vi.fn(() => Promise.reject())
    const mockErrorFn = vi.fn()
    renderHook(() =>
      usePolling(mockFn, INTERVAL, {
        onError: mockErrorFn,
      })
    )

    const interval = async (): Promise<void> => {
      await act(async () => {
        await mockAnimationFrame.runFrame()
        vi.advanceTimersByTime(INTERVAL)
      })
    }

    await interval()
    await act(async () => {
      await mockAnimationFrame.runFrame()
      vi.advanceTimersByTime(INTERVAL)
    })

    expect(mockErrorFn).toHaveBeenCalledTimes(1)
  })
})
