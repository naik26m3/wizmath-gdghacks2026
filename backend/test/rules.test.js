import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RULES_PATH = path.resolve(__dirname, '../firestore.rules')

let testEnv

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-rules-test',
    firestore: {
      rules: fs.readFileSync(RULES_PATH, 'utf8'),
      host: 'localhost',
      port: 8280,
    },
  })
})

afterAll(async () => {
  if (testEnv) await testEnv.cleanup()
})

beforeEach(async () => {
  if (testEnv) await testEnv.clearFirestore()
})

const aliceDb = () => testEnv.authenticatedContext('alice').firestore()
const bobDb = () => testEnv.authenticatedContext('bob').firestore()
const anonDb = () => testEnv.unauthenticatedContext().firestore()

describe('users/{uid}', () => {
  it('rejects unauthenticated read', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users', 'alice')))
  })

  it('allows any authenticated user to read user docs', async () => {
    await assertSucceeds(getDoc(doc(aliceDb(), 'users', 'bob')))
  })

  it('allows owner to create their own user doc', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'users', 'alice'), { xp: 0, level: 1 }))
  })

  it('rejects creating someone else\'s user doc', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'users', 'bob'), { xp: 999 }))
  })

  it('rejects unauthenticated write', async () => {
    await assertFails(setDoc(doc(anonDb(), 'users', 'alice'), { xp: 0 }))
  })

  it('rejects delete even by owner', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', 'alice'), { xp: 0 })
    })
    await assertFails(deleteDoc(doc(aliceDb(), 'users', 'alice')))
  })
})

describe('leaderboard/{uid}', () => {
  it('allows authenticated read of any leaderboard row', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'leaderboard', 'bob'), { xp: 100 })
    })
    await assertSucceeds(getDoc(doc(aliceDb(), 'leaderboard', 'bob')))
  })

  it('rejects unauthenticated read', async () => {
    await assertFails(getDoc(doc(anonDb(), 'leaderboard', 'alice')))
  })

  it('allows owner to write own leaderboard row', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'leaderboard', 'alice'), { xp: 50 }))
  })

  it('rejects writing another user\'s leaderboard row', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'leaderboard', 'bob'), { xp: 999 }))
  })

  it('rejects delete', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'leaderboard', 'alice'), { xp: 0 })
    })
    await assertFails(deleteDoc(doc(aliceDb(), 'leaderboard', 'alice')))
  })
})

describe('miniGames/{gameId}', () => {
  it('rejects unauthenticated create', async () => {
    await assertFails(setDoc(doc(anonDb(), 'miniGames', 'g1'), { ownerUid: 'alice' }))
  })

  it('allows owner to create their own game', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'miniGames', 'g1'), { ownerUid: 'alice', title: 'X' }))
  })

  it('rejects creating game with someone else as owner', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'miniGames', 'g1'), { ownerUid: 'bob', title: 'X' }))
  })

  it('rejects reading another user\'s game', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'miniGames', 'g1'), { ownerUid: 'alice' })
    })
    await assertFails(getDoc(doc(bobDb(), 'miniGames', 'g1')))
  })

  it('allows owner to read their own game', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'miniGames', 'g1'), { ownerUid: 'alice' })
    })
    await assertSucceeds(getDoc(doc(aliceDb(), 'miniGames', 'g1')))
  })

  it('allows owner to delete their own game', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'miniGames', 'g1'), { ownerUid: 'alice' })
    })
    await assertSucceeds(deleteDoc(doc(aliceDb(), 'miniGames', 'g1')))
  })

  it('rejects non-owner from deleting', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'miniGames', 'g1'), { ownerUid: 'alice' })
    })
    await assertFails(deleteDoc(doc(bobDb(), 'miniGames', 'g1')))
  })
})

describe('catch-all denies everything else', () => {
  it('rejects writes to unknown collections', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'secrets', 'x'), { v: 1 }))
  })

  it('rejects reads from unknown collections', async () => {
    await assertFails(getDoc(doc(aliceDb(), 'secrets', 'x')))
  })
})
