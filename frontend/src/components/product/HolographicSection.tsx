import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { HolographicCard, type HolographicCardItem } from './HolographicCard';

const holoCards: HolographicCardItem[] = [
  { title: 'Holographic card 00', imageUrl: '/img/card00.jpg' },
  { title: 'Holographic card 01', imageUrl: '/img/card01.jpg' },
  { title: 'Holographic card 02', imageUrl: '/img/card02.jpg' },
  { title: 'Holographic card 03', imageUrl: '/img/card03.jpg' },
];

const effects = ['glitter', 'sparkle', 'glitter', 'clean'] as const;

export function HolographicSection() {
  return (
    <section className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Holographic showcase
            </Badge>
            <h2 className="mt-4 text-3xl font-black text-[#9f1239] md:text-5xl">Hiệu ứng foil cao cấp.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7f1d3a]/78">
              Rê chuột lên từng card để xem ánh hologram, kim tuyến và vệt sáng phản hồi theo góc nhìn.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {holoCards.map((item, index) => (
            <HolographicCard key={item.title} item={item} effect={effects[index]} />
          ))}
        </div>
      </div>
    </section>
  );
}
