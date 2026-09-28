import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import MapPage from './pages/MapPage';
import MaintenancePage from './pages/MaintenancePage';
import AuditLogPage from './pages/AuditLogPage';
import AnomaliesPage from './pages/AnomaliesPage';
import UsersPage from './pages/UsersPage';
import CitizenReportsPage from './pages/CitizenReportsPage';
import LandingPage from './pages/LandingPage';
import OrgStructurePage from './pages/OrgStructurePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e48',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'DEPT_ADMIN', 'FIELD_OFFICER']}>
                  <MaintenancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'AUDITOR']}>
                  <AuditLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/anomalies"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'DEPT_ADMIN', 'AUDITOR']}>
                  <AnomaliesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'DEPT_ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN']}>
                  <OrgStructurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen-reports"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'DEPT_ADMIN']}>
                  <CitizenReportsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
