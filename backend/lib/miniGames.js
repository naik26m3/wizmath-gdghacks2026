import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase.js'

const COLLECTION = 'miniGames'

export async function listMiniGames(ownerUid, max = 20) {
  if (!ownerUid) return []
  const q = query(
    collection(db, COLLECTION),
    where('ownerUid', '==', ownerUid),
    orderBy('createdAt', 'desc'),
    fbLimit(max),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createMiniGame(ownerUid, payload) {
  if (!ownerUid) throw new Error('createMiniGame: ownerUid required')
  const ref = await addDoc(collection(db, COLLECTION), {
    ownerUid,
    title: payload.title ?? 'Untitled',
    description: payload.description ?? '',
    prompt: payload.prompt ?? '',
    math_concept: payload.math_concept ?? 'other',
    difficulty: payload.difficulty ?? 'medium',
    thumbnail_color: payload.thumbnail_color ?? 'green',
    game_config: payload.game_config ?? {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  const created = await getDoc(ref)
  return { id: ref.id, ...created.data() }
}

export async function deleteMiniGame(id) {
  if (!id) throw new Error('deleteMiniGame: id required')
  await deleteDoc(doc(db, COLLECTION, id))
}
