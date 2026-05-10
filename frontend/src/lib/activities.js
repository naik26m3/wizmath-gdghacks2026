import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase.js';

const COLLECTION = 'activities';

function ensureReady() {
  if (!isFirebaseConfigured() || !db) {
    throw new Error(
      'Firebase is not configured. Add your Firebase keys to frontend/.env (see frontend/.env.example).'
    );
  }
}

/**
 * Save a new activity to Firestore.
 * Anonymous mode: no auth, just an authorName string.
 */
export async function publishActivity({
  title,
  description = '',
  commands = [],
  settings = null,
  thumbnail = null,
  authorName = 'Anonymous',
  authorUid = null,
  authorPhotoURL = null,
}) {
  ensureReady();
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required.');
  }
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('Cannot publish an empty canvas.');
  }

  console.log('[publishActivity] sending to Firestore...', { title, commandCount: commands.length, authorName });
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      title: title.trim(),
      description: description.trim(),
      commands,
      settings,
      thumbnail,
      authorName,
      authorUid,
      authorPhotoURL,
      stars: 0,
      starredBy: [],
      views: 0,
      viewedBy: [],
      createdAt: serverTimestamp(),
    });
    console.log('[publishActivity] success! doc id:', ref.id);
    return { id: ref.id };
  } catch (err) {
    console.error('[publishActivity] FAILED:', err.code, err.message, err);
    throw err;
  }
}

/**
 * Fetch the most recent activities (default: 50).
 */
export async function listActivities(max = 50) {
  ensureReady();
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch one activity by ID.
 * @param {string} id
 * @returns {Promise<any|null>}
 */
export async function getActivity(id) {
  ensureReady();
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Record that a user viewed this activity. Idempotent per user — only counts the first view.
 * Returns { firstView: boolean } so caller knows whether to award XP.
 */
export async function recordActivityView(activityId, userId) {
  ensureReady();
  if (!activityId || !userId) return { firstView: false };
  const ref = doc(db, COLLECTION, activityId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.warn('[recordActivityView] activity not found:', activityId);
    return { firstView: false };
  }
  const data = snap.data();
  const viewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
  if (viewedBy.includes(userId)) {
    console.log('[recordActivityView] already viewed by this user, skipping');
    return { firstView: false };
  }
  try {
    await updateDoc(ref, {
      viewedBy: arrayUnion(userId),
      views: increment(1),
    });
    console.log('[recordActivityView] view recorded ✓');
    return { firstView: true };
  } catch (err) {
    console.error('[recordActivityView] FAILED:', err.code, err.message);
    if (err.code === 'permission-denied') {
      console.error('[recordActivityView] HINT: Update Firestore rules in Firebase Console — the views/viewedBy update is being blocked. See backend/firestore.rules for the latest version.');
    }
    throw err;
  }
}

/**
 * Update title/description for an existing activity. Author-only (enforced by rules).
 */
export async function updateActivity(activityId, { title, description }) {
  ensureReady();
  if (!activityId) throw new Error('Missing activity id.');
  const patch = {};
  if (typeof title === 'string') patch.title = title.trim();
  if (typeof description === 'string') patch.description = description.trim();
  if (Object.keys(patch).length === 0) return;
  await updateDoc(doc(db, COLLECTION, activityId), patch);
}

/**
 * Delete an activity. Author-only (enforced by rules).
 */
export async function deleteActivity(activityId) {
  ensureReady();
  if (!activityId) throw new Error('Missing activity id.');
  await deleteDoc(doc(db, COLLECTION, activityId));
}

/**
 * Toggle a star on an activity. Atomic increment/decrement + arrayUnion/Remove.
 * Returns { isStarred, stars } reflecting the new state.
 */
export async function toggleStar(activityId, userId) {
  ensureReady();
  if (!userId) throw new Error('Sign in to star activities.');
  if (!activityId) throw new Error('Missing activity id.');

  const ref = doc(db, COLLECTION, activityId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Activity not found.');
  const data = snap.data();
  const wasStarred = Array.isArray(data.starredBy) && data.starredBy.includes(userId);
  const oldCount = typeof data.stars === 'number' ? data.stars : 0;

  if (wasStarred) {
    await updateDoc(ref, {
      starredBy: arrayRemove(userId),
      stars: increment(-1),
    });
    return { isStarred: false, stars: Math.max(oldCount - 1, 0) };
  }
  await updateDoc(ref, {
    starredBy: arrayUnion(userId),
    stars: increment(1),
  });
  return { isStarred: true, stars: oldCount + 1 };
}
