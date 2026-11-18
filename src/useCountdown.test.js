import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { secondsLeft, useCountdown } from './useCountdown'

afterEach(() => vi.useRealTimers())

describe('secondsLeft', () => {
  it('counts whole seconds remaining, rounding up', () => {
    expect(secondsLeft(10_000, 0, 0)).toBe(10)
    expect(secondsLeft(10_000, 0, 500)).toBe(10)
  })
  it('never goes below zero', () => {
    expect(secondsLeft(1_000, 0, 5_000)).toBe(0)
  })
  it('applies the server/device clock offset', () => {
    // device clock is 3s behind the server, so the server-side deadline is 3s closer
    expect(secondsLeft(10_000, 3_000, 0)).toBe(7)
  })
})

describe('useCountdown', () => {
  it('ticks down and stops at zero', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const { result } = renderHook(() => useCountdown(5_000))
    expect(result.current).toBe(5)
    act(() => { vi.advanceTimersByTime(3_000) })
    expect(result.current).toBe(2)
    act(() => { vi.advanceTimersByTime(10_000) })
    expect(result.current).toBe(0)
  })
})
