import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

function AuthSkeleton() {
  return (
    <div className="flex items-center mx-auto px-4 py-10 w-full max-w-md">
      <div className="space-y-4 w-full">
        <Skeleton className="rounded-full w-32 h-10" />
        <Skeleton className="rounded-full w-3/5 h-6" />
        <Skeleton className="rounded-[28px] w-full h-105" />
      </div>
    </div>
  );
}

export function AuthLayout() {
  return (
      <div className="relative flex flex-col bg-[radial-gradient(circle_at_top,rgba(255,31,71,0.12),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(244,114,182,0.16),transparent_28%),linear-gradient(180deg,#fff7f8_0%,#ffffff_40%,#fafafa_100%)] min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="-top-20 left-1/2 absolute bg-primary/10 blur-3xl rounded-full w-64 h-64 -translate-x-1/2" />
        <div className="top-32 -right-24 absolute bg-rose-200/40 blur-3xl rounded-full w-72 h-72" />
        <div className="-bottom-32 -left-16 absolute bg-primary/5 blur-3xl rounded-full w-72 h-72" />
      </div>

      <Header />

        <main className="relative flex flex-1 justify-center items-center px-4 py-8 sm:py-10">
          <Suspense fallback={<AuthSkeleton />}>
            <Outlet />
          </Suspense>
        </main>

        <Toaster />
    </div>
  );
}