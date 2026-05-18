import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return (
      <main className="boot-screen">
        <div className="spinner" />
        <p>Đang khởi tạo ShopCard Admin...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
