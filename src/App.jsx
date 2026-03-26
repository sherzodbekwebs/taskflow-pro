import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext'; // Yo'lga e'tibor bering
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import TaskDetailPage from './pages/TaskDetailPage';
import { Loader2 } from 'lucide-react'; 

function ProtectedRoute({ children }) {
  const { currentUser, isAuthLoading } = useApp();
  if (isAuthLoading) return null; 
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-slate-900 dark:text-white font-bold tracking-tight">TaskFlow</h2>
          <p className="text-xs text-slate-500 font-medium animate-pulse uppercase tracking-widest">
            Sinxronizatsiya jarayoni...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to="/" replace /> : <LoginPage />
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}