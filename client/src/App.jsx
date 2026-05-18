import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import AnalyticsSetup from './pages/AnalyticsSetup';
import RecommendationResults from './pages/RecommendationResults';
import AIPerformance from './pages/AIPerformance';
import SavedEvaluations from './pages/SavedEvaluations';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-pulse" style={{ height: '100vh' }} />;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeForm />} />
        <Route path="employees/:id/edit" element={<EmployeeForm />} />
        
        <Route path="analytics" element={<AnalyticsSetup />} />
        <Route path="analytics/results" element={<RecommendationResults />} />
        
        <Route path="ai-performance" element={<AIPerformance />} />
        
        <Route path="saved-evaluations" element={<SavedEvaluations />} />
      </Route>
    </Routes>
  );
}
