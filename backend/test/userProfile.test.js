import { describe, it, expect, beforeEach } from 'vitest'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { ensureUserProfile, awardXp } from '../lib/userProfile.js'
import { clearFirestore } from './setup.js'

const fakeAuthUser = (uid, overrides = {}) => ({
  uid,
  displayName: 'Test User',
  photoURL: null,
  ...overrides,
})

describe('ensureUserProfile', () => {
  beforeEach(async () => {
    await clearFirestore()
  })

  it('creates users/{uid} and leaderboard/{uid} on first call', async () => {
    const profile = await ensureUserProfile(fakeAuthUser('alice'))

    expect(profile.xp).toBe(0)
    expect(profile.level).toBe(1)
    expect(profile.displayName).toBe('Test User')
    expect(profile.badges).toEqual([])
    expect(['🦊', '🐼', '🦉']).toContain(profile.avatarEmoji)

    const userDoc = await getDoc(doc(db, 'users', 'alice'))
    expect(userDoc.exists()).toBe(true)
    expect(userDoc.data().xp).toBe(0)

    const lbDoc = await getDoc(doc(db, 'leaderboard', 'alice'))
    expect(lbDoc.exists()).toBe(true)
    expect(lbDoc.data().xp).toBe(0)
  })

  it('returns existing profile without overwriting on second call', async () => {
    await ensureUserProfile(fakeAuthUser('bob'))
    await awardXp('bob', 150)

    const profile2 = await ensureUserProfile(fakeAuthUser('bob'))
    expect(profile2.xp).toBe(150)
    expect(profile2.level).toBe(2)
  })

  it('falls back to "Explorer" when displayName is missing', async () => {
    const profile = await ensureUserProfile(fakeAuthUser('charlie', { displayName: undefined }))
    expect(profile.displayName).toBe('Explorer')
  })
})

describe('awardXp', () => {
  beforeEach(async () => {
    await clearFirestore()
  })

  it('adds XP and recomputes level on both user and leaderboard rows', async () => {
    await ensureUserProfile(fakeAuthUser('dora'))
    const result = await awardXp('dora', 250)

    expect(result.xp).toBe(250)
    expect(result.level).toBe(3)

    const lb = await getDoc(doc(db, 'leaderboard', 'dora'))
    expect(lb.data().xp).toBe(250)
  })

  it('accumulates across calls', async () => {
    await ensureUserProfile(fakeAuthUser('evan'))
    await awardXp('evan', 100)
    await awardXp('evan', 150)
    const result = await awardXp('evan', 50)

    expect(result.xp).toBe(300)
    expect(result.level).toBe(4)
  })

  it('throws if user profile is missing', async () => {
    await expect(awardXp('ghost', 50)).rejects.toThrow(/User profile missing/)
  })
})
