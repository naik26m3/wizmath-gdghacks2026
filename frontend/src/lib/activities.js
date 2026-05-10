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
}) {
  ensureReady();
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required.');
  }
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('Cannot publish an empty canvas.');
  }

  const ref = await addDoc(collection(db, COLLECTION), {
    title: title.trim(),
    description: description.trim(),
    commands,
    settings,
    thumbnail,
    authorName,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
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
