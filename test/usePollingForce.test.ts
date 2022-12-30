import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePollingForce } from '../src/usePollingForce'

describe('usePolling', () => {
  it('should run automatically on render.', () => {
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePollingForce(mockFn, 1000))

    expect(result.current.isPaused).toBeFalsy()
  })

  it('should bew paused by executing pause().', () => {
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePollingForce(mockFn, 1000))

    act(() => {
      result.current.pause()
    })

    expect(result.current.isPaused).toBeTruthy()
  })

  it('should be resumed by executing resume() during pause.', () => {
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePollingForce(mockFn, 1000))

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
    renderHook(() => usePollingForce(mockFn, 1000))

    expect(mockFn).not.toBeCalled()
  })

  it('should execute the callback after the specified timeout.', () => {
    const INTERVAL = 1
    vi.useFakeTimers()
    const mockFn = vi.fn(() => Promise.resolve())
    renderHook(() => usePollingForce(mockFn, INTERVAL))

    for (let i = 1; i < 10; i++) {
      act(() => {
        vi.advanceTimersToNextTimer()
      })
      expect(mockFn).toHaveBeenCalledTimes(i)
    }
  })

  it('should not execute the callback if it is paused.', () => {
    const INTERVAL = 1
    vi.useFakeTimers()
    const mockFn = vi.fn(() => Promise.resolve())
    const { result } = renderHook(() => usePollingForce(mockFn, INTERVAL))

    act(() => {
      result.current.pause()
    })

    for (let i = 1; i < 5; i++) {
      act(() => {
        vi.advanceTimersToNextTimer()
      })
      expect(mockFn).toHaveBeenCalledTimes(0)
    }

    act(() => {
      result.current.resume()
    })

    for (let i = 1; i < 5; i++) {
      act(() => {
        vi.advanceTimersToNextTimer()
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
      usePollingForce(mockFn, INTERVAL, {
        onError: mockErrorFn,
      })
    )

    await act(async () => {
      vi.advanceTimersToNextTimer()
    })

    expect(mockErrorFn).toHaveBeenCalledTimes(1)
  })
})
