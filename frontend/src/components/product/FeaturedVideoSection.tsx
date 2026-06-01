import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Play, Video } from 'lucide-react';
import type { Sample } from '@/types/product.types';

export function FeaturedVideoSection({ samples }: { samples: Sample[] }) {
  const videoSamples = samples
    .filter((sample) => (sample.videos?.length || 0) > 0)
    .slice(0, 4);

  if (videoSamples.length === 0) return null;

  return (
    <section className="px-4 pb-10 md:pb-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge className="rounded-full bg-[#8b5cf6]/10 px-3 py-1.5 text-[#7c3aed] hover:bg-[#8b5cf6]/10">
              <Video className="h-3.5 w-3.5" />
              Video sản phẩm nổi bật
            </Badge>
            <h2 className="mt-4 text-3xl font-black text-[#9f1239] md:text-5xl">Xem hiệu ứng chuyển động thực tế.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7f1d3a]/78">
              Các mẫu đang có video được gom riêng để xem nhanh chuyển động, ánh phủ và cảm giác sản phẩm trước khi mở chi tiết.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {videoSamples.map((sample) => (
            <Link
              key={sample.id}
              to={`/product-detail/${sample.slug}`}
              className="group relative block cursor-pointer overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white shadow-[0_18px_54px_rgba(253,20,63,0.1)] transition-colors duration-200 hover:border-primary/30"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#fff7f9]">
                <video
                  src={sample.videos?.[0]?.videoUrl}
                  poster={sample.thumbnailUrl || sample.imageUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(event) => void event.currentTarget.play()}
                  onMouseLeave={(event) => {
                    event.currentTarget.pause();
                    event.currentTarget.currentTime = 0;
                  }}
                />
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.34)_42%,transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-lg backdrop-blur">
                  <Play className="h-4 w-4 fill-current" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{sample.productType?.name || 'Lenti Lab'}</p>
                <h3 className="mt-2 line-clamp-2 text-lg font-black text-[#9f1239]">{sample.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
