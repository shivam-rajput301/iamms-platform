import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RequestAccessPage } from '@/pages/RequestAccessPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { AssetDetailsPage } from '@/pages/AssetDetailsPage';
import { AssetFormPage } from '@/pages/AssetFormPage';
import { RequestsPage } from '@/pages/RequestsPage';
import { NewRequestPage } from '@/pages/NewRequestPage';
import { RequestDetailsPage } from '@/pages/RequestDetailsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PendingRegistrationsPage } from '@/pages/admin/PendingRegistrationsPage';
import { AllUsersPage } from '@/pages/admin/AllUsersPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/request-access" element={<RequestAccessPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/assets" element={<ProtectedRoute permission="assets:view"><AssetsPage /></ProtectedRoute>} />
                <Route path="/assets/new" element={<ProtectedRoute permission="assets:create"><AssetFormPage mode="create" /></ProtectedRoute>} />
                <Route path="/assets/:id" element={<ProtectedRoute permission="assets:view"><AssetDetailsPage /></ProtectedRoute>} />
                <Route path="/assets/:id/edit" element={<ProtectedRoute permission="assets:edit"><AssetFormPage mode="edit" /></ProtectedRoute>} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/requests/new" element={<ProtectedRoute permission="requests:create"><NewRequestPage /></ProtectedRoute>} />
                <Route path="/requests/:id" element={<RequestDetailsPage />} />
                <Route path="/inventory" element={<ProtectedRoute permission="inventory:view"><InventoryPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute permission="reports:view"><ReportsPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<ProtectedRoute permission="settings:view"><SettingsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/admin/pending-registrations"
                  element={
                    <ProtectedRoute role="super_admin">
                      <PendingRegistrationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute role="super_admin">
                      <AllUsersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
