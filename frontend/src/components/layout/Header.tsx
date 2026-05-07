import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SHOP_NAME, SHOP_SHORT_NAME } from '@/lib/site';
import {
  BadgeDollarSign,
  GalleryHorizontalEnd,
  HeartHandshake,
  Image,
  LogOut,
  Menu,
  X,
  Settings,
} from 'lucide-react';

const publicNav = [
  { to: '/products', label: 'Sản phẩm', icon: GalleryHorizontalEnd },
  { to: '/loved', label: 'Yêu thích', icon: HeartHandshake },
  { to: '/pricing', label: 'Bảng giá', icon: BadgeDollarSign },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="top-0 z-40 sticky bg-white/88 backdrop-blur-2xl border-primary/10 border-b">
      <div className="flex justify-between items-center gap-4 mx-auto px-4 h-18 min-h-[72px] container">
        <Link
          to="/"
          className="group flex items-center gap-3 lg:gap-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-w-0"
          aria-label="Về trang chủ"
        >
          <span className="z-10 relative place-items-center grid bg-[conic-gradient(from_145deg,#fd143f,#fb923c,#8b5cf6,#fd143f)] shadow-[0_16px_34px_rgba(253,20,63,0.22)] group-hover:shadow-[0_20px_44px_rgba(253,20,63,0.3)] p-[3px] lg:p-1 rounded-full w-[54px] lg:w-[120px] h-[54px] lg:h-[120px] group-hover:scale-[0.97] transition translate-y-0 lg:translate-y-7 duration-300 shrink-0">
            <span className="top-2.5 -right-1 absolute bg-[#fb923c] shadow-[0_6px_14px_rgba(251,146,60,0.28)] border border-white rounded-full w-3 lg:w-4 h-3 lg:h-4" />
            <span className="-bottom-0 left-4 absolute bg-[#8b5cf6] shadow-[0_6px_14px_rgba(139,92,246,0.24)] border border-white rounded-full w-2.5 lg:w-3 h-2.5 lg:h-3" />
            <span className="place-items-center grid bg-white p-[3px] rounded-full w-full h-full">
              <img
                src="/img/logo.jpg"
                alt="Lenti Lab"
                className="rounded-full ring-1 ring-primary/10 w-full h-full object-cover"
              />
            </span>
          </span>
          <div className="hidden sm:block min-w-0 leading-tight">
            <div className="font-bold text-[10px] text-primary uppercase tracking-[0.24em]">{SHOP_SHORT_NAME}</div>
            <div className="max-w-[210px] lg:max-w-[260px] font-black text-[#9f1239] text-[15px] lg:text-[17px] truncate">{SHOP_NAME}</div>
          </div>
        </Link>

        <nav
          className="hidden lg:flex items-center gap-1 bg-white/80 shadow-[0_16px_38px_rgba(253,20,63,0.08)] p-1 border border-primary/10 rounded-full"
          aria-label="Điều hướng chính"
        >
          {publicNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${active
                  ? 'bg-primary text-white shadow-[0_10px_24px_rgba(253,20,63,0.18)]'
                  : 'text-[#7f1d3a] hover:bg-primary/6 hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2 bg-white shadow-[0_12px_28px_rgba(253,20,63,0.08)] px-2 py-1.5 border border-primary/10 rounded-xl">
              <div className="flex justify-center items-center bg-primary/10 rounded-lg w-8 h-8 text-primary">
                <Image className="w-4 h-4" />
              </div>
              <span className="max-w-28 font-semibold text-[#7f1d3a] text-sm truncate">{user?.fullName || user?.email?.split('@')[0]}</span>
              {user?.isAdmin && (
                <Button variant="ghost" size="icon" className="hover:bg-primary/6 rounded-lg w-8 h-8 hover:text-primary" asChild>
                  <Link to="/admin" aria-label="Trang quản trị">
                    <Settings className="w-4 h-4" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="hover:bg-primary/6 rounded-lg w-8 h-8 hover:text-primary" onClick={handleLogout} aria-label="Đăng xuất">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-white hover:bg-primary/5 shadow-sm border-primary/15 hover:border-primary/30 rounded-xl text-[#7f1d3a] hover:text-primary" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-4 border-0 rounded-xl text-white" asChild>
                <Link to="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden bg-white shadow-sm border border-primary/15 rounded-xl text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white/96 shadow-[0_24px_60px_rgba(253,20,63,0.12)] px-4 py-4 border-primary/10 border-t">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center bg-[#fff7f9] mb-4 p-3 border border-primary/10 rounded-2xl">
              <div>
                <p className="font-bold text-[10px] text-primary uppercase tracking-[0.22em]">{SHOP_SHORT_NAME}</p>
                <p className="mt-1 font-black text-[#9f1239] text-sm">{SHOP_NAME}</p>
              </div>
            </div>

            <div className="gap-2 grid">
            {publicNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors duration-200 ${active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-[#fff7f9] text-[#7f1d3a] hover:bg-primary/5 hover:text-primary'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  <ArrowIndicator active={active} />
                </Link>
              );
            })}
            </div>

          <div className="gap-2 grid bg-[#fff7f9] mt-4 p-4 border border-primary/10 rounded-2xl text-sm">
            {isAuthenticated ? (
              <>
                <p className="font-semibold text-[#7f1d3a]">{user?.fullName || user?.email}</p>
                <button className="flex items-center gap-2 hover:bg-white px-3 py-2 rounded-xl w-full font-semibold text-destructive text-left" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="gap-2 grid">
                <Button variant="outline" className="bg-white hover:bg-primary/5 border-primary/15 hover:border-primary/30 rounded-xl w-full hover:text-primary" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary/90 border-0 rounded-xl w-full text-white" asChild>
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
          </div>
        </div>
      )}

    </header>
  );
}

function ArrowIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={`h-2 w-2 rounded-full ${active ? 'bg-white' : 'bg-primary/35'}`}
      aria-hidden="true"
    />
  );
}
