import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { samplesApi } from '@/api/products.api';
import { SEOHead } from '@/components/common/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mockSamples } from '@/lib/mock-products';
import { SHOP_ZALO_HREF } from '@/lib/site';
import { ArrowLeft, ArrowRight, BadgeCheck, Layers3, MessageCircle, Palette, Rotate3D, Sparkles } from 'lucide-react';

const featureCards = [
  { title: 'Hiệu ứng nhìn nghiêng', text: 'Tạo cảm giác chuyển ảnh, chiều sâu hoặc chuyển động khi đổi góc nhìn.', icon: Rotate3D },
  { title: 'Thiết kế theo nội dung', text: 'Có thể tinh chỉnh layer, màu sắc, bố cục và chất liệu theo từng ý tưởng.', icon: Palette },
  { title: 'Phù hợp quà tặng', text: 'Dùng tốt cho standee, card sưu tầm, POSM, booth và chiến dịch thương hiệu.', icon: BadgeCheck },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();

  const fallbackSample = useMemo(
    () => mockSamples.find((sample) => sample.slug === slug),
    [slug],
  );

  const { data: remoteSample, isLoading } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () => samplesApi.getBySlug(slug!),
    enabled: !!slug && !fallbackSample,
    retry: false,
  });

  const sample = remoteSample || fallbackSample;
  const gallery = [
    sample?.imageUrl,
    sample?.thumbnailUrl,
    ...(sample?.images?.map((image) => image.imageUrl) || []),
  ].filter(Boolean) as string[];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-[2rem]" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3 rounded-full" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!sample) {
    return (
      <section className="px-4 py-20">
        <div className="container mx-auto rounded-[2rem] border border-primary/10 bg-white p-10 text-center shadow-[0_24px_70px_rgba(253,20,63,0.08)]">
          <Layers3 className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-black text-[#9f1239]">Không tìm thấy sản phẩm</h1>
          <Button asChild className="mt-6 rounded-2xl bg-primary text-white hover:bg-primary/90">
            <Link to="/products">Quay lại sản phẩm</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <SEOHead title={sample.name} description={sample.description || 'Chi tiết mẫu ảnh nổi 3D Lenticular tại Lenti Lab.'} />

      <section className="home-creative relative overflow-hidden px-4 py-10 md:py-14">
        <div className="pointer-events-none absolute right-[8%] top-20 h-28 w-28 rounded-full bg-[#8b5cf6]/14 blur-2xl" />
        <div className="pointer-events-none absolute bottom-16 left-[12%] h-28 w-28 rounded-full bg-[#fb923c]/16 blur-2xl" />

        <div className="container relative mx-auto">
          <Button asChild variant="ghost" className="mb-6 rounded-2xl text-[#7f1d3a] hover:bg-primary/5 hover:text-primary">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
              Quay lại sản phẩm
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="rounded-[2rem] border border-primary/10 bg-white/90 p-4 shadow-[0_30px_90px_rgba(253,20,63,0.12)] backdrop-blur">
              <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[#fff7f9]">
                <img
                  src={sample.imageUrl || sample.thumbnailUrl || 'https://placehold.co/900x900/fff1f4/fd143f?text=Lenti+Lab'}
                  alt={sample.name}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.28),transparent_26%),linear-gradient(125deg,transparent,rgba(253,20,63,0.08),transparent)]" />
              </div>
              {gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {gallery.slice(0, 4).map((image, index) => (
                    <div key={`${image}-${index}`} className="aspect-square overflow-hidden rounded-2xl border border-primary/10 bg-white">
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Badge className="rounded-full bg-primary/10 px-4 py-2 text-primary hover:bg-primary/10">
                <Sparkles className="h-3.5 w-3.5" />
                {sample.productType?.name || 'Lenti Lab'}
              </Badge>
              <h1 className="mt-5 text-4xl font-black leading-tight text-[#9f1239] md:text-6xl">{sample.name}</h1>
              {sample.description && (
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#7f1d3a]/78">{sample.description}</p>
              )}
              {sample.tags && sample.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {sample.tags.map((tag) => (
                    <Badge key={tag} className="rounded-full bg-white px-3 py-1 text-primary shadow-sm hover:bg-white">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {featureCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[1.5rem] border border-primary/10 bg-white/86 p-4 shadow-[0_16px_38px_rgba(253,20,63,0.08)]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="mt-4 text-sm font-black text-[#be123c]">{item.title}</h2>
                      <p className="mt-2 text-xs leading-5 text-[#7f1d3a]/70">{item.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-2xl bg-primary px-7 text-white shadow-[0_18px_38px_rgba(253,20,63,0.24)] hover:bg-primary/90">
                  <a href={SHOP_ZALO_HREF}>
                    <MessageCircle className="h-4 w-4" />
                    Tư vấn mẫu này
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-2xl border-primary/20 bg-white px-7 text-primary hover:bg-primary/5">
                  <Link to="/bang-gia">
                    Xem bảng giá
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
