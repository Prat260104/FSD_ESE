import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddCandidate from './pages/AddCandidate';
import CandidateList from './pages/CandidateList';
import JobRequirements from './pages/JobRequirements';
import MatchResults from './pages/MatchResults';
import AIRecommendations from './pages/AIRecommendations';
import SavedShortlists from './pages/SavedShortlists';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="loading-pulse" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="candidates/new" element={<AddCandidate />} />
        <Route path="candidates/:id/edit" element={<AddCandidate />} />
        <Route path="candidates" element={<CandidateList />} />
        <Route path="match" element={<JobRequirements />} />
        <Route path="match/results" element={<MatchResults />} />
        <Route path="ai-recommendations" element={<AIRecommendations />} />
        <Route path="shortlists" element={<SavedShortlists />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
