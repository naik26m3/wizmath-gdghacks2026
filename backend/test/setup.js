import { afterAll, beforeAll } from 'vitest'
import { connectAuthEmulator, signInAnonymously, setPersistence, inMemoryPersistence } from 'firebase/auth'
import { connectFirestoreEmulator, terminate } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID

// Set permissive test rules via environment variable
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8280'

beforeAll(async () => {
  if (auth) {
    connectAuthEmulator(auth, 'http://localhost:9299', { disableWarnings: true })
    await setPersistence(auth, inMemoryPersistence)
    await signInAnonymously(auth)
  }
  if (db) connectFirestoreEmulator(db, 'localhost', 8280)
})

export async function clearFirestore() {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wizmath-gdghacks2026-48f1e'
  const res = await fetch(
    `http://localhost:8280/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: 'DELETE' },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Clear emulator failed: ${res.status} ${text}`)
  }
}

afterAll(async () => {
  if (db) await terminate(db)
})
