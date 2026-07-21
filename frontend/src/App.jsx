import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import Activities from '@/pages/Activities';
import Create from '@/pages/Create';
import Activity from '@/pages/Activity';
import Leaderboard from '@/pages/Leaderboard';
import Play from '@/pages/Play';
import SignInModal from '@/components/wizmath/SignInModal';

// Old /signin URL → bounce to /activities and open the modal so existing links keep working.
function SignInRedirect() {
  const { openSignInModal } = useAuth();
  useEffect(() => { openSignInModal(); }, [openSignInModal]);
  return <Navigate to="/activities" replace />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/signin" element={<SignInRedirect />} />
        <Route path="/create" element={<Create />} />
        <Route path="/activity/:id" element={<Activity />} />
        <Route path="/activity/:id/play" element={<Play />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SignInModal />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
