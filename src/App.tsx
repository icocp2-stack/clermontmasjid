import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import PublicHomePage from './pages/PublicHomePage';
import PrayerTimesPage from './pages/PrayerTimesPage';
import RamadanTrackerPage from './pages/RamadanTrackerPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ImamLoginPage from './pages/ImamLoginPage';
import AdminPanel from './components/AdminPanel';
import ImamDashboard from './components/ImamDashboard';
import ImamsCorner from './components/ImamsCorner';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !role.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function ProtectedImamRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !role.canManagePosts) {
    return <Navigate to="/imam" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/ramadan-tracker" element={<RamadanTrackerPage />} />
          <Route path="/imams-corner" element={<ImamsCorner />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/imam" element={<ImamLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/imam/dashboard"
            element={
              <ProtectedImamRoute>
                <ImamDashboard />
              </ProtectedImamRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
