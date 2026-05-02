import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productTypesApi, samplesApi } from '@/api/products.api';
import { SEOHead } from '@/components/common/SEOHead';
import { HolographicSection } from '@/components/product/HolographicSection';
import { SampleCard } from '@/components/product/SampleCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { mockProductTypes, mockSamples } from '@/lib/mock-products';
import { SHOP_HOTLINE, SHOP_HOTLINE_HREF, SHOP_ZALO_HREF } from '@/lib/site';
import {
  ArrowRight,
  Filter,
  Grid3X3,
  Layers3,
  MessageCircle,
  Phone,
  Rotate3D,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3 rounded-[1.5rem] border border-primary/10 bg-white p-3">
          <Skeleton className="aspect-square rounded-[1.25rem]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function RotatingStandee({
  src,
  alt,
  className = '',
  imageClassName = '',
  animationDelay,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  animationDelay?: string;
}) {
  return (
    <div className={`absolute z-20 origin-bottom ${className}`}>
      <div className="relative h-full w-full">
        <img
          src={src}
          alt={alt}
          className={`product-standee-spin absolute inset-x-0 top-0 z-30 mx-auto h-[78%] w-full object-contain object-bottom drop-shadow-[0_22px_28px_rgba(127,29,58,0.22)] ${imageClassName}`}
          style={animationDelay ? { animationDelay } : undefined}
          loading="eager"
        />
        <div className="absolute bottom-[16%] left-1/2 z-20 h-10 w-2.5 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#ffffff,#ffd9e1_55%,#fd143f)] shadow-[0_10px_18px_rgba(253,20,63,0.16)] ring-1 ring-white/80" />
        <div className="absolute bottom-[10%] left-1/2 z-30 h-8 w-16 -translate-x-1/2 sm:h-9 sm:w-20">
          <div className="absolute inset-x-0 bottom-1.5 h-4 rounded-b-[50%] rounded-t-[36%] bg-[linear-gradient(90deg,rgba(255,255,255,0.82),rgba(255,247,249,0.96)_42%,rgba(253,20,63,0.14)_100%)] shadow-[0_10px_20px_rgba(253,20,63,0.14)] ring-1 ring-white/75 sm:h-5" />
          <div className="absolute inset-x-0 top-0 h-6 rounded-[50%] bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#fff7f9_48%,rgba(253,20,63,0.16)_78%,rgba(253,20,63,0.04)_100%)] shadow-[inset_0_-4px_8px_rgba(253,20,63,0.07)] ring-1 ring-white/85 sm:h-7" />
          <div className="absolute inset-x-2 bottom-2 h-1.5 rounded-full bg-white/55" />
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>();
  const [query, setQuery] = useState('');

  const { data: productTypes = [] } = useQuery({
    queryKey: ['product-types'],
    queryFn: () => productTypesApi.getAll(),
  });

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ['samples', selectedTypeId],
    queryFn: () => samplesApi.getAll(selectedTypeId),
  });

  const displayProductTypes = productTypes.length > 0 ? productTypes : mockProductTypes;
  const displaySamples = samples.length > 0 ? samples : mockSamples;

  const filteredSamples = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const byType = selectedTypeId
      ? displaySamples.filter((sample) => sample.productTypeId === selectedTypeId)
      : displaySamples;

    if (!keyword) return byType;

    return byType.filter((sample) =>
      [sample.name, sample.description, sample.tags?.join(' '), sample.productType?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [displaySamples, query, selectedTypeId]);

  const activeType = displayProductTypes.find((type) => type.id === selectedTypeId);

  return (
    <>
      <SEOHead
        title="Sản phẩm"
        description="Danh mục mẫu ảnh nổi 3D Lenticular, bộ lọc nhanh, tìm kiếm sản phẩm và liên hệ tư vấn."
      />

      <section className="home-creative relative overflow-hidden px-4 pb-8 pt-8 md:pb-12 md:pt-12">
        <div className="pointer-events-none absolute right-[8%] top-12 h-24 w-24 rounded-full bg-[#8b5cf6]/14 blur-2xl" />
        <div className="pointer-events-none absolute bottom-8 left-[16%] h-24 w-24 rounded-full bg-[#fb923c]/16 blur-2xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-6 rounded-[2rem] border border-primary/10 bg-white/88 p-5 shadow-[0_30px_90px_rgba(253,20,63,0.1)] backdrop-blur md:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
                <Grid3X3 className="h-3.5 w-3.5" />
                Catalog sản phẩm
              </Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-[#9f1239] md:text-6xl">
                Lọc mẫu theo hiệu ứng, màu sắc và cảm giác 3D.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#7f1d3a]">
                Duyệt các mẫu lenticular theo danh mục, từ khóa và tag. Mỗi mẫu là một hướng nhìn để bắt đầu ý tưởng.
              </p>
              <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  {
                    label: 'Danh mục',
                    value: displayProductTypes.length,
                    color: 'bg-primary',
                    effect: 'Kim tuyến',
                    card: 'bg-[radial-gradient(circle_at_18%_20%,rgba(253,20,63,0.16),transparent_24%),radial-gradient(circle_at_76%_28%,rgba(251,146,60,0.18),transparent_22%),linear-gradient(135deg,#ffffff,#fff7f9)]',
                    shine: 'bg-[conic-gradient(from_8deg_at_24%_28%,transparent_0deg,rgba(255,255,255,0.9)_8deg,rgba(251,146,60,0.34)_12deg,transparent_18deg,transparent_38deg,rgba(139,92,246,0.28)_43deg,transparent_49deg,transparent_72deg,rgba(253,20,63,0.22)_78deg,transparent_84deg,transparent_360deg),conic-gradient(from_20deg_at_72%_48%,transparent_0deg,rgba(255,255,255,0.9)_6deg,rgba(139,92,246,0.34)_10deg,transparent_16deg,transparent_34deg,rgba(251,146,60,0.28)_40deg,transparent_46deg,transparent_68deg,rgba(253,20,63,0.25)_74deg,transparent_80deg,transparent_360deg),linear-gradient(115deg,transparent,rgba(255,255,255,0.34)_42%,transparent_58%)]',
                  },
                  {
                    label: 'Mẫu phù hợp',
                    value: filteredSamples.length,
                    color: 'bg-[#8b5cf6]',
                    effect: 'Hologram',
                    card: 'bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.9)_36%,rgba(255,247,237,0.86)_66%,rgba(255,241,244,0.95))]',
                    shine: 'bg-[linear-gradient(115deg,transparent_0%,rgba(139,92,246,0.16)_28%,rgba(251,146,60,0.16)_48%,rgba(253,20,63,0.14)_68%,transparent_100%)]',
                  },
                  {
                    label: 'Hỗ trợ',
                    value: 'Zalo',
                    color: 'bg-[#fb923c]',
                    effect: 'Glow',
                    card: 'bg-[radial-gradient(circle_at_80%_12%,rgba(251,146,60,0.22),transparent_28%),linear-gradient(135deg,#ffffff,#fff7ed)]',
                    shine: 'bg-[radial-gradient(circle_at_70%_20%,rgba(251,146,60,0.24),transparent_30%)]',
                  },
                ].map((item) => (
                  <div key={item.label} className={`relative overflow-hidden rounded-2xl p-4 ring-1 ring-primary/10 ${item.card}`}>
                    <span className={`pointer-events-none absolute inset-0 opacity-80 ${item.shine}`} />
                    <span className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/45 blur-xl" />
                    <div className="relative">
                      <span className={`mb-4 block h-2 w-8 rounded-full ${item.color}`} />
                      <p className="text-2xl font-black text-[#be123c]">{item.value}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#9f1239]/70">{item.label}</p>
                      <p className="mt-3 w-fit rounded-full bg-white/72 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary shadow-sm">
                        {item.effect}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_20%_18%,rgba(253,20,63,0.12),transparent_26%),radial-gradient(circle_at_82%_22%,rgba(139,92,246,0.16),transparent_24%),linear-gradient(180deg,#ffffff,#fff7f9)] p-6 sm:min-h-[500px]">
              <div className="pointer-events-none absolute left-7 top-8 h-16 w-16 rotate-[-12deg] rounded-2xl border border-primary/12 bg-white/80 shadow-[12px_12px_0_rgba(253,20,63,0.08)]" />
              <div className="pointer-events-none absolute bottom-10 right-8 h-20 w-20 rounded-full bg-[#fb923c]/18 blur-xl" />

              <div className="relative mx-auto flex h-full min-h-[390px] max-w-[460px] items-end justify-center [perspective:900px]">
                <RotatingStandee
                  src="/img/standee2.png"
                  alt="Mẫu standee nhân vật thứ hai"
                  className="bottom-[58px] left-[4%] h-[280px] w-[206px] sm:bottom-[62px] sm:left-[3%] sm:h-[330px] sm:w-[244px]"
                  animationDelay="-1.875s"
                />
                <RotatingStandee
                  src="/img/standee.png"
                  alt="Mẫu standee nhân vật xoay"
                  className="bottom-[58px] right-[4%] h-[280px] w-[206px] sm:bottom-[62px] sm:right-[3%] sm:h-[330px] sm:w-[244px]"
                />

                <div className="absolute left-3 top-5 rounded-2xl border border-primary/10 bg-white/92 px-4 py-3 shadow-[12px_12px_0_rgba(253,20,63,0.08)] backdrop-blur">
                  <Rotate3D className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-black text-[#be123c]">Ảnh nhân vật xoay 360°</p>
                </div>
                <div className="absolute bottom-4 right-2 rounded-full border border-[#8b5cf6]/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed] shadow-[0_14px_34px_rgba(139,92,246,0.12)]">
                  Đế tròn acrylic
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HolographicSection />

      <section className="px-4 pb-14 md:pb-18">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-primary/10 bg-white p-4 shadow-[0_18px_60px_rgba(253,20,63,0.08)] lg:sticky lg:top-24">
            <div className="flex items-center gap-2 border-b border-primary/10 pb-4">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="font-black text-[#9f1239]">Bộ lọc</h2>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="product-search" className="text-sm font-bold text-[#7f1d3a]">Tìm kiếm</label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
                  <Input
                    id="product-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tên mẫu, tag..."
                    className="h-11 rounded-xl border-primary/15 bg-[#fff7f9] pl-10 text-[#7f1d3a]"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-[#7f1d3a]">Danh mục</p>
                <div className="mt-2 grid gap-2">
                  <Button
                    variant={!selectedTypeId ? 'default' : 'outline'}
                    className="justify-start rounded-xl"
                    onClick={() => setSelectedTypeId(undefined)}
                  >
                    <Filter className="h-4 w-4" />
                    Tất cả mẫu
                  </Button>
                  {displayProductTypes.map((pt) => (
                    <Button
                      key={pt.id}
                      variant={selectedTypeId === pt.id ? 'default' : 'outline'}
                      className="justify-start rounded-xl border-primary/15 bg-white text-[#7f1d3a] hover:bg-primary/5 hover:text-primary"
                      onClick={() => setSelectedTypeId(pt.id)}
                    >
                      {pt.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-primary p-4 text-white shadow-[0_18px_48px_rgba(253,20,63,0.18)]">
                <Sparkles className="h-5 w-5" />
                <p className="mt-3 text-sm font-bold">Cần mẫu riêng?</p>
                <p className="mt-1 text-xs leading-5 text-white/84">Gửi ý tưởng để được tư vấn hiệu ứng và chất liệu phù hợp.</p>
                <div className="mt-4 grid gap-2">
                  <Button size="sm" className="rounded-xl bg-white text-primary hover:bg-white/95" asChild>
                    <a href={SHOP_ZALO_HREF}>
                      <MessageCircle className="h-4 w-4" />
                      Chat Zalo
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary" asChild>
                    <a href={SHOP_HOTLINE_HREF}>
                      <Phone className="h-4 w-4" />
                      {SHOP_HOTLINE}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-3 rounded-[2rem] border border-primary/10 bg-white p-4 shadow-[0_18px_60px_rgba(253,20,63,0.06)] sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-black text-[#be123c]">
                  {activeType ? activeType.name : 'Tất cả sản phẩm'}
                </p>
                <p className="mt-1 text-sm text-[#7f1d3a]">Đang hiển thị {filteredSamples.length} mẫu phù hợp.</p>
              </div>
              <Button variant="outline" className="rounded-xl border-primary/15 bg-white text-primary hover:bg-primary/5" asChild>
                <Link to="/bang-gia">
                  Xem bảng giá tham khảo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="sr-only" aria-live="polite">
              Đang hiển thị {filteredSamples.length} mẫu sản phẩm.
            </div>

            {isLoading ? (
              <SkeletonGrid />
            ) : filteredSamples.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white py-20 text-center">
                <Layers3 className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-4 text-lg font-black text-[#be123c]">Chưa có mẫu phù hợp</p>
                <p className="mt-2 text-sm text-[#7f1d3a]">Thử đổi từ khóa hoặc chọn lại danh mục sản phẩm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredSamples.map((sample) => (
                  <SampleCard key={sample.id} sample={sample} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
