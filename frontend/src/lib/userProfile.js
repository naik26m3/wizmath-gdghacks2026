import { doc, getDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from './firebase.js'
import { xpToLevel } from './xp.js'

const DEFAULT_AVATARS = ['🦊', '🐼', '🦉']

/**
 * Creates `users/{uid}` and `leaderboard/{uid}` if missing (first Google sign-in).
 */
export async function ensureUserProfile(authUser) {
  const userRef = doc(db, 'users', authUser.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) return snap.data()

  const avatarEmoji =
    DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]

  const profile = {
    displayName: authUser.displayName ?? 'Explorer',
    photoURL: authUser.photoURL ?? null,
    xp: 0,
    level: 1,
    avatarEmoji,
    equippedHat: null,
    badges: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const lbRow = {
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    xp: 0,
    avatarEmoji,
    equippedHat: null,
    updatedAt: serverTimestamp(),
  }

  const batch = writeBatch(db)
  batch.set(userRef, profile)
  batch.set(doc(db, 'leaderboard', authUser.uid), lbRow)
  await batch.commit()

  return profile
}

/**
 * Adds XP and keeps `users` + `leaderboard` rows in sync.
 */
export async function awardXp(uid, amount) {
  const userRef = doc(db, 'users', uid)
  const lbRef = doc(db, 'leaderboard', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    throw new Error('User profile missing — ensureUserProfile should run after sign-in.')
  }

  const cur = snap.data()
  const xp = (cur.xp ?? 0) + amount
  const level = xpToLevel(xp)

  const batch = writeBatch(db)
  batch.set(
    userRef,
    { xp, level, updatedAt: serverTimestamp() },
    { merge: true },
  )
  batch.set(
    lbRef,
    {
      displayName: cur.displayName ?? 'Explorer',
      photoURL: cur.photoURL ?? null,
      xp,
      avatarEmoji: cur.avatarEmoji ?? '🦊',
      equippedHat: cur.equippedHat ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  await batch.commit()

  return { xp, level }
}
