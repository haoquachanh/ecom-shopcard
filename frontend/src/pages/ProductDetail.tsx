import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/common/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SHOP_ZALO_HREF } from '@/lib/site';
import { samplesService } from '@/services/products.service';
import { ArrowLeft, ArrowRight, BadgeCheck, Layers3, MessageCircle, Palette, Play, Rotate3D, Sparkles } from 'lucide-react';

const featureCards = [
  { title: 'Hiệu ứng nhìn nghiêng', text: 'Tạo cảm giác chuyển ảnh, chiều sâu hoặc chuyển động khi đổi góc nhìn.', icon: Rotate3D },
  { title: 'Thiết kế theo nội dung', text: 'Có thể tinh chỉnh layer, màu sắc, bố cục và chất liệu theo từng ý tưởng.', icon: Palette },
  { title: 'Phù hợp quà tặng', text: 'Dùng tốt cho standee, card sưu tầm, POSM, booth và chiến dịch thương hiệu.', icon: BadgeCheck },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);

  const { data: sample, isLoading, isError } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () => samplesService.getBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });

  const gallery = useMemo(() => {
    if (!sample) return [];
    const media = sample.media?.filter((item) => item.url) ?? [];
    if (media.length > 0) {
      const imageMedia = media.filter((item) => item.type === 'image');
      const videoMedia = media.filter((item) => item.type === 'video');
      return [...imageMedia, ...videoMedia];
    }
    return (sample.images || []).map((image) => ({
      id: image.id,
      type: 'image' as const,
      url: image.imageUrl,
      sortOrder: image.sortOrder,
    }));
  }, [sample]);
  const selectedMedia = gallery.find((item) => item.id === selectedMediaId) ?? gallery[0];

  if (isLoading) {
    return (
      <div className="mx-auto px-4 py-10 container">
        <div className="gap-8 grid lg:grid-cols-2">
          <Skeleton className="rounded-[2rem] aspect-square" />
          <div className="space-y-4">
            <Skeleton className="rounded-full w-2/3 h-8" />
            <Skeleton className="rounded-2xl w-full h-16" />
            <Skeleton className="rounded-[2rem] w-full h-36" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !sample) {
    return (
      <>
        <SEOHead
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm không tồn tại hoặc đã ngừng hiển thị tại Lenti Lab."
          canonicalPath={slug ? `/product-detail/${slug}` : '/products'}
          noindex
        />
        <section className="px-4 py-20">
          <div className="bg-white shadow-[0_24px_70px_rgba(253,20,63,0.08)] mx-auto p-10 border border-primary/10 rounded-[2rem] text-center container">
            <Layers3 className="mx-auto w-10 h-10 text-primary" />
            <h1 className="mt-4 font-black text-[#9f1239] text-2xl">Không tìm thấy sản phẩm</h1>
            <Button asChild className="bg-primary hover:bg-primary/90 mt-6 rounded-2xl text-white">
              <Link to="/products">Quay lại sản phẩm</Link>
            </Button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`${sample.name} - Mẫu ảnh nổi 3D`}
        description={sample.description || 'Chi tiết mẫu ảnh nổi 3D lenticular tại Lenti Lab, phù hợp quà tặng, trưng bày và thương hiệu.'}
        canonicalPath={`/product-detail/${sample.slug}`}
        image={sample.imageUrl || sample.thumbnailUrl || '/img/logo.jpg'}
        type="product"
        keywords={[sample.name, sample.productType?.name || '', ...(sample.tags || [])].filter(Boolean)}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: sample.name,
          description: sample.description || 'Mẫu ảnh nổi 3D lenticular tại Lenti Lab.',
          image: [sample.imageUrl, sample.thumbnailUrl, ...(sample.images?.map((item) => item.imageUrl) || [])].filter(Boolean),
          category: sample.productType?.name,
          brand: {
            '@type': 'Brand',
            name: 'Lenti Lab',
          },
        }}
      />

      <section className="relative px-4 py-10 md:py-14 overflow-hidden home-creative">
        <div className="top-20 right-[8%] absolute bg-[#8b5cf6]/14 blur-2xl rounded-full w-28 h-28 pointer-events-none" />
        <div className="bottom-16 left-[12%] absolute bg-[#fb923c]/16 blur-2xl rounded-full w-28 h-28 pointer-events-none" />

        <div className="relative mx-auto container">
          <Button asChild variant="ghost" className="hover:bg-primary/5 mb-6 rounded-2xl text-[#7f1d3a] hover:text-primary">
            <Link to="/products">
              <ArrowLeft className="w-4 h-4" />
              Quay lại sản phẩm
            </Link>
          </Button>

          <div className="lg:items-center gap-8 grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="bg-white/90 shadow-[0_30px_90px_rgba(253,20,63,0.12)] backdrop-blur p-4 border border-primary/10 rounded-[2rem]">
              <div className="relative bg-[#fff7f9] rounded-[1.5rem] aspect-square overflow-hidden">
                {selectedMedia?.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    poster={sample.thumbnailUrl || sample.imageUrl}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={selectedMedia?.url || sample.imageUrl || sample.thumbnailUrl || 'https://placehold.co/900x900/fff1f4/fd143f?text=Lenti+Lab'}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.28),transparent_26%),linear-gradient(125deg,transparent,rgba(253,20,63,0.08),transparent)] pointer-events-none" />
              </div>
              {gallery.length > 1 && (
                <div className="gap-3 grid grid-cols-4 mt-3">
                  {gallery.slice(0, 8).map((media) => (
                    <button
                      key={`${media.type}-${media.id}`}
                      type="button"
                      className={`relative bg-white border rounded-2xl aspect-square overflow-hidden transition-colors ${selectedMedia?.id === media.id ? 'border-primary' : 'border-primary/10 hover:border-primary/40'}`}
                      onClick={() => setSelectedMediaId(media.id)}
                    >
                      {media.type === 'video' ? (
                        <>
                          <video src={media.url} className="h-full w-full object-cover" muted preload="metadata" />
                          <span className="absolute inset-0 grid place-items-center bg-black/18 text-white">
                            <Play className="h-5 w-5 fill-current" />
                          </span>
                        </>
                      ) : (
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Badge className="bg-primary/10 hover:bg-primary/10 px-4 py-2 rounded-full text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                {sample.productType?.name || 'Lenti Lab'}
              </Badge>
              <h1 className="mt-5 font-black text-[#9f1239] text-4xl md:text-6xl leading-tight">{sample.name}</h1>
              {sample.description && (
                <p className="mt-5 max-w-2xl text-[#7f1d3a]/78 text-base leading-8">{sample.description}</p>
              )}
              {sample.tags && sample.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {sample.tags.map((tag) => (
                    <Badge key={tag} className="bg-white hover:bg-white shadow-sm px-3 py-1 rounded-full text-primary">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="gap-3 grid sm:grid-cols-3 mt-8">
                {featureCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="bg-white/86 shadow-[0_16px_38px_rgba(253,20,63,0.08)] p-4 border border-primary/10 rounded-[1.5rem]">
                      <div className="flex justify-center items-center bg-primary/10 rounded-xl w-10 h-10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="mt-4 font-black text-[#be123c] text-sm">{item.title}</h2>
                      <p className="mt-2 text-[#7f1d3a]/70 text-xs leading-5">{item.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-[0_18px_38px_rgba(253,20,63,0.24)] px-7 rounded-2xl text-white">
                  <a href={SHOP_ZALO_HREF}>
                    <MessageCircle className="w-4 h-4" />
                    Tư vấn mẫu này
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white hover:bg-primary/5 px-7 border-primary/20 rounded-2xl text-primary">
                  <Link to="/pricing">
                    Xem bảng giá
                    <ArrowRight className="w-4 h-4" />
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
