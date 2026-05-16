import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { UsersPage } from '@/features/users/UsersPage';
import { ProductTypesPage } from '@/features/catalog/ProductTypesPage';
import { SamplesPage } from '@/features/catalog/SamplesPage';
import { PriceManagementPage } from '@/features/catalog/PriceManagementPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AdminLayout } from '@/shared/layouts/AdminLayout';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="product-types" element={<ProductTypesPage />} />
          <Route path="samples" element={<SamplesPage />} />
          <Route path="pricing" element={<PriceManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
