import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from './firebase.js'

/**
 * Top 10 by XP descending — matches BLUEPRINT leaderboard query.
 * Unsubscribe by calling the returned function.
 */
export function subscribeTopTen(onNext, onError) {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('xp', 'desc'),
    limit(10),
  )
  return onSnapshot(q, onNext, onError)
}
