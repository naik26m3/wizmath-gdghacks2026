import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from './firebase.js'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase env missing — add frontend/.env (see frontend/.env.example).')
  const { user } = await signInWithPopup(auth, provider)
  return user
}

export function signOutUser() {
  if (!auth) return Promise.resolve()
  return signOut(auth)
}
