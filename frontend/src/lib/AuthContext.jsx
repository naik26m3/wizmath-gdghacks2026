import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@wizmath/lib/firebase.js';
import { signInWithGoogle, signOutUser } from '@wizmath/lib/auth.js';
import { ensureUserProfile } from '@wizmath/lib/userProfile.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setAuthError({
        type: 'config_missing',
        message: 'Firebase config missing — copy frontend/.env.example to frontend/.env and restart.',
      });
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return undefined;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const data = await ensureUserProfile(firebaseUser);
          setProfile(data);
        } catch (e) {
          setAuthError({ type: 'profile_error', message: e?.message ?? String(e) });
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    return () => unsub();
  }, []);

  const navigateToLogin = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      // User-cancelled popups aren't worth surfacing as errors.
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return;
      setAuthError({ type: 'auth_required', message: e?.message ?? String(e) });
    }
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        authError,
        authChecked,
        logout,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
