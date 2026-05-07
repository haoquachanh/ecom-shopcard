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
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="bg-[linear-gradient(180deg,#fff7f9_0%,#ffffff_100%)] mt-16 border-primary/10 border-t">
        <div className="mx-auto px-4 py-10 md:py-12 max-w-7xl">
          <div className="gap-8 grid lg:grid-cols-[1.25fr_0.7fr_1.05fr]">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark compact />
                <div>
                  <p className="font-bold text-[10px] text-primary uppercase tracking-[0.24em]">{SHOP_SHORT_NAME}</p>
                  <p className="mt-1 font-black text-[#9f1239]">{SHOP_NAME}</p>
                </div>
              </div>
              <p className="mt-4 max-w-md text-[#7f1d3a] text-sm leading-6">{SHOP_TAGLINE}</p>
              <div className="flex gap-2 mt-5">
                <span className="bg-primary rounded-full w-12 h-2" />
                <span className="bg-[#fb923c] rounded-full w-8 h-2" />
                <span className="bg-[#8b5cf6] rounded-full w-8 h-2" />
              </div>
            </div>

            <div>
              <p className="font-black text-[#9f1239]">Khám phá</p>
              <nav className="gap-3 grid mt-4 text-sm" aria-label="Điều hướng chân trang">
                {[
                  { to: '/', label: 'Trang chủ' },
                  { to: '/products', label: 'Sản phẩm' },
                  { to: '/pricing', label: 'Bảng giá' },
                  { to: '/loved', label: 'Yêu thích' },
                ].map((item) => (
                  <Link key={item.to} to={item.to} className="text-[#7f1d3a] hover:text-primary transition-colors duration-200">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="font-black text-[#9f1239]">Liên hệ</p>
              <div className="space-y-3 mt-4 text-[#7f1d3a] text-sm">
                <a href={SHOP_HOTLINE_HREF} className="flex items-center gap-3 hover:text-primary transition-colors duration-200">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{SHOP_HOTLINE}</span>
                </a>
                <a href={SHOP_EMAIL_HREF} className="flex items-center gap-3 hover:text-primary transition-colors duration-200">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{SHOP_EMAIL}</span>
                </a>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 w-4 h-4 text-[#8b5cf6] shrink-0" />
                  <span className="leading-6">{SHOP_ADDRESS}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-3 mt-8 pt-5 border-primary/10 border-t text-[#9f1239]/70 text-sm">
            <p>© 2026 {SHOP_NAME}. All rights reserved.</p>
            <p className="font-semibold text-[#9f1239]">Lenti Lab · 3D Lenticular</p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
