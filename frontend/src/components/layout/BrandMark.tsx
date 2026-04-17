import React from 'react';
import { Sparkles } from 'lucide-react';

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  const sizeClass = compact ? 'h-10 w-10' : 'h-12 w-12';

  return (
    <div
      className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_28%_24%,rgba(255,255,255,0.96),rgba(255,255,255,0.26)_24%,rgba(253,20,63,1)_62%,rgba(251,146,60,0.88)_100%)] shadow-[0_18px_30px_rgba(253,20,63,0.22)] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/35" />
      <div className="top-2 left-2 absolute bg-white/90 rounded-full w-2 h-2" />
      <div className="right-2 bottom-2 absolute bg-white/80 rounded-full w-2 h-2" />
      <div className="top-3 absolute inset-x-3 flex justify-center items-center bg-white/18 p-1 rounded-full text-white">
        <Sparkles className="w-5 h-5" />
      </div>
    </div>
  );
}
