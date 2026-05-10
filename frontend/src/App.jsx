<<<<<<< HEAD
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Studio from '@/pages/Studio';
import Library from '@/pages/Library';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Studio />} />
      <Route path="/library" element={<Library />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
=======
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@wizmath/lib/firebase.js'
import { signInWithGoogle, signOutUser } from '@wizmath/lib/auth.js'
import { ensureUserProfile, awardXp } from '@wizmath/lib/userProfile.js'
import { subscribeTopTen } from '@wizmath/lib/leaderboard.js'
import './App.css'

export default function App() {
  const configured = isFirebaseConfigured()
  const [user, setUser] = useState(null)
  const [profileReady, setProfileReady] = useState(false)
  const [xp, setXp] = useState(null)
  const [level, setLevel] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!configured || !auth) return undefined
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setProfileReady(false)
      setXp(null)
      setLevel(null)
      setError('')
      if (!u) return
      setBusy(true)
      try {
        const data = await ensureUserProfile(u)
        setXp(data.xp ?? 0)
        setLevel(data.level ?? 1)
        setProfileReady(true)
      } catch (e) {
        setError(e?.message ?? String(e))
      } finally {
        setBusy(false)
      }
    })
    return () => unsubAuth()
  }, [configured])

  useEffect(() => {
    if (!configured || !user) {
      setRows([])
      return undefined
    }
    const unsubLb = subscribeTopTen(
      (snap) => {
        const next = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        setRows(next)
      },
      (err) => setError(err?.message ?? String(err)),
    )
    return () => unsubLb()
  }, [configured, user])

  async function handleSignIn() {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(e?.message ?? String(e))
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setError('')
    await signOutUser()
  }

  async function handleEarnXp() {
    if (!user || !profileReady) return
    setBusy(true)
    setError('')
    try {
      const { xp: nextXp, level: nextLevel } = await awardXp(user.uid, 15)
      setXp(nextXp)
      setLevel(nextLevel)
    } catch (e) {
      setError(e?.message ?? String(e))
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    return (
      <section className="panel">
        <h1>WizMath</h1>
        <p>
          Firebase Web config is missing. Copy <code>frontend/.env.example</code> to{' '}
          <code>frontend/.env</code>, paste your keys from Firebase Console → Project settings → Your apps → Web,
          then restart <code>npm run dev</code>.
        </p>
      </section>
    )
  }

  return (
    <>
      <header className="hero">
        <h1>WizMath</h1>
        <p className="tag">Sign in, earn XP, climb the leaderboard.</p>
      </header>

      <section className="panel">
        {!user && (
          <>
            <p>Use Google sign-in (same provider you enabled in Firebase).</p>
            <button type="button" disabled={busy} onClick={handleSignIn}>
              Sign in with Google
            </button>
          </>
        )}
        {user && (
          <div className="row profile-row">
            <span className="avatar">{user.photoURL ? <img src={user.photoURL} alt="" width={36} height={36} /> : '👤'}</span>
            <span className="name">{user.displayName ?? user.email}</span>
            <button type="button" className="secondary" disabled={busy} onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        )}
        {profileReady && user && (
          <p className="stats">
            Level <strong>{level}</strong> · <strong>{xp}</strong> XP
          </p>
        )}
        {error && <p className="err">{error}</p>}
      </section>

      {profileReady && user && (
        <section className="panel">
          <p>Demo: correct answer (+15 XP).</p>
          <button type="button" disabled={busy} onClick={handleEarnXp}>
            Solve a problem (+15 XP)
          </button>
        </section>
      )}

      {user && (
        <section className="panel">
          <h2 className="h2">Top 10</h2>
          {rows.length === 0 ? (
            <p className="muted">No scores yet — be the first.</p>
          ) : (
            <ol className="leader-list">
              {rows.map((r, i) => (
                <li key={r.id}>
                  <span>
                    {i + 1}. {r.displayName ?? 'Explorer'} {r.avatarEmoji ?? ''}
                  </span>
                  <span>{r.xp ?? 0} XP</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </>
  )
}
>>>>>>> fd93c5f9f9ccf11910c1378fbd675c1f50fa35dd
