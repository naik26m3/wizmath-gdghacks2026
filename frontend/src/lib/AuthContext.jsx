import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase.js';
import { signInWithGoogle, signOutUser } from './firebaseAuth.js';
import { ensureUserProfile } from './userProfile.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      // Firebase not configured — stay in unauthenticated state, don't crash.
      setIsLoadingAuth(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        // Make sure users/{uid} and leaderboard/{uid} rows exist
        try {
          const p = await ensureUserProfile(fbUser);
          setProfile(p);
        } catch (e) {
          console.warn('ensureUserProfile failed:', e);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const signIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Sign-in failed:', e);
      setAuthError(e?.message || 'Sign-in failed');
    }
  };

  const logout = async () => {
    try { await signOutUser(); } catch (e) { console.warn('Sign-out failed:', e); }
  };

  const value = {
    user,                                // Firebase user object (or null)
    profile,                             // Firestore users/{uid} doc (or null)
    isAuthenticated: !!user,
    isLoadingAuth,
    isLoadingPublicSettings: false,      // legacy, kept for compat
    authError,
    appPublicSettings: null,             // legacy
    authChecked: !isLoadingAuth,         // legacy
    signIn,
    logout,
    navigateToLogin: signIn,             // legacy alias
    checkUserAuth: async () => {},       // legacy no-op
    checkAppState: async () => {},       // legacy no-op
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
