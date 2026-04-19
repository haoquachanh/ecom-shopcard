import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useLovedStore } from '@/stores/loved.store';
import type { Sample } from '@/types/product.types';

interface SampleCardProps { sample: Sample; }

export function SampleCard({ sample }: SampleCardProps) {
  const isLoved = useLovedStore((state) => state.isLoved(sample.id));
  const toggleLoved = useLovedStore((state) => state.toggleLoved);

  const lovedItem = {
    id: sample.id,
    slug: sample.slug,
    name: sample.name,
    thumbnailUrl: sample.thumbnailUrl,
    imageUrl: sample.imageUrl,
    description: sample.description,
    tags: sample.tags,
    productTypeId: sample.productTypeId,
    productTypeName: sample.productType?.name,
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border-primary/10 bg-white shadow-[0_18px_44px_rgba(253,20,63,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_64px_rgba(253,20,63,0.14)]">
      <div className="relative aspect-square overflow-hidden bg-primary/5">
        <img
          src={sample.thumbnailUrl || sample.imageUrl || 'https://placehold.co/300x300/f1f5f9/64748b?text=No+Image'}
          alt={sample.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <Button
          variant="secondary"
          size="icon"
          className={`absolute right-3 top-3 h-9 w-9 rounded-xl border border-primary/10 bg-white/95 shadow-[0_10px_24px_rgba(253,20,63,0.14)] backdrop-blur transition-colors ${isLoved ? 'text-primary' : 'text-[#9f1239]'}`}
          onClick={() => toggleLoved(lovedItem)}
          aria-label={isLoved ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart className={`h-4 w-4 ${isLoved ? 'fill-current' : ''}`} />
        </Button>
        {sample.tags && sample.tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {sample.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full bg-white/92 text-xs text-primary shadow-sm backdrop-blur-sm">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
      <CardContent className="flex-1 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          {sample.productType?.name}
        </p>
        <h3 className="text-sm font-bold leading-snug text-[#9f1239] line-clamp-2">{sample.name}</h3>
        {sample.description && (
          <p className="mt-1 text-xs text-[#7f1d3a]/65 line-clamp-2">{sample.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full rounded-2xl bg-primary text-white shadow-[0_12px_26px_rgba(253,20,63,0.18)] hover:bg-primary/90" size="sm">
          <Link to={`/product-sample/${sample.slug}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
