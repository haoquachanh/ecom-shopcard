import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Gauge,
  LogOut,
  Package,
  PanelLeft,
  Settings,
  Sparkles,
  Tags,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { getApiBaseUrl } from '@/shared/api/client';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, Badge } from '@/shared/components/ui';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/product-types', label: 'Product Types', icon: Package },
  { to: '/samples', label: 'Samples', icon: Sparkles },
  { to: '/pricing', label: 'Pricing Data', icon: Tags },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const health = useQuery({
    queryKey: ['api-health', location.pathname],
    queryFn: adminApi.health,
    retry: false,
  });

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">SC</div>
          <div>
            <strong>ShopCard</strong>
            <span>Admin Desktop</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="account-card">
            <span>{user?.name || user?.email}</span>
            <small>{user?.role === 'admin' ? 'Quản trị viên' : 'Tài khoản chưa có role admin'}</small>
          </div>
          <Button variant="ghost" className="logout-btn" onClick={logout}>
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <PanelLeft size={18} />
            <span>Quản lý dữ liệu online qua backend API</span>
          </div>
          <div className="topbar-meta">
            <span className="api-url">{getApiBaseUrl()}</span>
            <Badge tone={health.isError ? 'danger' : health.isFetching ? 'warning' : 'success'}>
              {health.isError ? <WifiOff size={13} /> : <Wifi size={13} />}
              {health.isError ? 'API chưa xác nhận' : health.isFetching ? 'Đang kiểm tra' : 'API reachable'}
            </Badge>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
