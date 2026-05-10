import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from '@/pages/Home';
import Studio from '@/pages/Studio';
import Library from '@/pages/Library';
import Activities from '@/pages/Activities';
import Create from '@/pages/Create';
import Activity from '@/pages/Activity';
import Slope from '@/pages/Slope';
import Leaderboard from '@/pages/Leaderboard';
import Play from '@/pages/Play';
import SignInModal from '@/components/wizmath/SignInModal';

// Old /signin URL → bounce to /activities and open the modal so existing links keep working.
function SignInRedirect() {
  const { openSignInModal } = useAuth();
  useEffect(() => { openSignInModal(); }, [openSignInModal]);
  return <Navigate to="/activities" replace />;
}

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
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/library" element={<Library />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/signin" element={<SignInRedirect />} />
        <Route path="/create" element={<Create />} />
        <Route path="/activity/:id" element={<Activity />} />
        <Route path="/activity/:id/play" element={<Play />} />
        <Route path="/slope" element={<Slope />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <SignInModal />
    </>
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