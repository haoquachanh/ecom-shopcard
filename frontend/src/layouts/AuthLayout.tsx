import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

function AuthSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Skeleton className="hidden h-[520px] rounded-[2rem] lg:block" />
        <Skeleton className="h-[520px] rounded-[2rem]" />
      </div>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="home-creative relative flex min-h-screen flex-col overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[7%] top-28 h-24 w-24 rotate-[-12deg] rounded-[1.7rem] border border-primary/15 bg-white/70 shadow-[20px_18px_0_rgba(253,20,63,0.08)] home-float-slow" />
        <div className="absolute right-[8%] top-24 h-32 w-32 rounded-full bg-[#8b5cf6]/14 blur-2xl home-float" />
        <div className="absolute bottom-12 left-[36%] h-36 w-36 rounded-full bg-[#fb923c]/14 blur-3xl" />
      </div>

      <Header />

      <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:py-14 lg:py-16">
        <Suspense fallback={<AuthSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <Toaster />
    </div>
  );
}
