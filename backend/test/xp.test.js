import { describe, it, expect } from 'vitest'
import { xpToLevel } from '../lib/xp.js'

describe('xpToLevel', () => {
  it('returns 1 at 0 XP', () => {
    expect(xpToLevel(0)).toBe(1)
  })

  it('clamps negative XP to level 1', () => {
    expect(xpToLevel(-50)).toBe(1)
    expect(xpToLevel(-1)).toBe(1)
  })

  it('stays at level 1 below 100 XP', () => {
    expect(xpToLevel(50)).toBe(1)
    expect(xpToLevel(99)).toBe(1)
  })

  it('promotes to level 2 at 100 XP', () => {
    expect(xpToLevel(100)).toBe(2)
    expect(xpToLevel(101)).toBe(2)
    expect(xpToLevel(199)).toBe(2)
  })

  it('scales linearly per 100 XP', () => {
    expect(xpToLevel(500)).toBe(6)
    expect(xpToLevel(1000)).toBe(11)
    expect(xpToLevel(2500)).toBe(26)
  })

  it('caps at 9999', () => {
    expect(xpToLevel(1_000_000)).toBe(9999)
    expect(xpToLevel(Number.MAX_SAFE_INTEGER)).toBe(9999)
  })

  it('coerces non-numeric to 0', () => {
    expect(xpToLevel('not a number')).toBe(1)
    expect(xpToLevel(undefined)).toBe(1)
    expect(xpToLevel(null)).toBe(1)
  })

  it('floors fractional XP', () => {
    expect(xpToLevel(99.99)).toBe(1)
    expect(xpToLevel(100.5)).toBe(2)
  })
})
