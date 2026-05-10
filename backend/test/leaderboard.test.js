import { describe, it, expect, beforeEach } from 'vitest'
import { subscribeTopTen } from '../lib/leaderboard.js'
import { ensureUserProfile, awardXp } from '../lib/userProfile.js'
import { clearFirestore } from './setup.js'

const seedUsers = async (count) => {
  for (let i = 0; i < count; i++) {
    const uid = `lb-${i}`
    await ensureUserProfile({ uid, displayName: `User ${i}`, photoURL: null })
    if (i > 0) await awardXp(uid, i * 100)
  }
}

const firstSnapshot = (subscribe) =>
  new Promise((resolve, reject) => {
    const unsub = subscribe(
      (snap) => {
        unsub()
        resolve(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      },
      (err) => {
        unsub()
        reject(err)
      },
    )
  })

describe('subscribeTopTen', () => {
  beforeEach(async () => {
    await clearFirestore()
  })

  it('returns top 10 leaderboard rows by xp desc', async () => {
    await seedUsers(12)

    const rows = await firstSnapshot(subscribeTopTen)

    expect(rows).toHaveLength(10)
    const xps = rows.map((r) => r.xp)
    expect(xps[0]).toBe(1100)
    expect(xps[9]).toBe(200)
    // Sorted strictly descending
    expect([...xps].sort((a, b) => b - a)).toEqual(xps)
  })

  it('returns fewer rows when fewer users exist', async () => {
    await seedUsers(3)
    const rows = await firstSnapshot(subscribeTopTen)
    expect(rows).toHaveLength(3)
  })

  it('returns empty when no leaderboard rows exist', async () => {
    const rows = await firstSnapshot(subscribeTopTen)
    expect(rows).toEqual([])
  })
})
