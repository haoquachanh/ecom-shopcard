import React, { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandMark } from '@/components/layout/BrandMark';
import {
  SHOP_ADDRESS,
  SHOP_EMAIL,
  SHOP_EMAIL_HREF,
  SHOP_HOTLINE,
  SHOP_HOTLINE_HREF,
  SHOP_NAME,
  SHOP_SHORT_NAME,
  SHOP_TAGLINE,
} from '@/lib/site';
import { Mail, MapPin, Phone } from 'lucide-react';

function PageSkeleton() {
  return (
    <div className="mx-auto px-4 py-8 container">
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="rounded-xl w-full h-48" />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="mt-16 border-t border-primary/10 bg-[linear-gradient(180deg,#fff7f9_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.7fr_1.05fr]">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark compact />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">{SHOP_SHORT_NAME}</p>
                  <p className="mt-1 font-black text-[#9f1239]">{SHOP_NAME}</p>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#7f1d3a]">{SHOP_TAGLINE}</p>
              <div className="mt-5 flex gap-2">
                <span className="h-2 w-12 rounded-full bg-primary" />
                <span className="h-2 w-8 rounded-full bg-[#fb923c]" />
                <span className="h-2 w-8 rounded-full bg-[#8b5cf6]" />
              </div>
            </div>

            <div>
              <p className="font-black text-[#9f1239]">Khám phá</p>
              <nav className="mt-4 grid gap-3 text-sm" aria-label="Điều hướng chân trang">
                {[
                  { to: '/', label: 'Trang chủ' },
                  { to: '/products', label: 'Sản phẩm' },
                  { to: '/bang-gia', label: 'Bảng giá' },
                  { to: '/loved', label: 'Yêu thích' },
                ].map((item) => (
                  <Link key={item.to} to={item.to} className="text-[#7f1d3a] transition-colors duration-200 hover:text-primary">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="font-black text-[#9f1239]">Liên hệ</p>
              <div className="mt-4 space-y-3 text-sm text-[#7f1d3a]">
                <a href={SHOP_HOTLINE_HREF} className="flex items-center gap-3 transition-colors duration-200 hover:text-primary">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span>{SHOP_HOTLINE}</span>
                </a>
                <a href={SHOP_EMAIL_HREF} className="flex items-center gap-3 transition-colors duration-200 hover:text-primary">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{SHOP_EMAIL}</span>
                </a>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
                  <span className="leading-6">{SHOP_ADDRESS}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-primary/10 pt-5 text-sm text-[#9f1239]/70 md:flex-row md:items-center md:justify-between">
            <p>© 2026 {SHOP_NAME}. All rights reserved.</p>
            <p className="font-semibold text-[#9f1239]">Lenti Lab · 3D Lenticular</p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
