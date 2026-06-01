import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/common/SEOHead';
import { FeaturedVideoSection } from '@/components/product/FeaturedVideoSection';
import { HolographicSection } from '@/components/product/HolographicSection';
import { SampleCard } from '@/components/product/SampleCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SHOP_HOTLINE, SHOP_HOTLINE_HREF, SHOP_ZALO_HREF } from '@/lib/site';
import { productTypesService, samplesService } from '@/services/products.service';
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
    <div className="gap-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3 bg-white p-3 border border-primary/10 rounded-[1.5rem]">
          <Skeleton className="rounded-[1.25rem] aspect-square" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-4" />
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
      <div className="relative w-full h-full">
        <img
          src={src}
          alt={alt}
          className={`product-standee-spin absolute inset-x-0 top-0 z-30 mx-auto h-[78%] w-full object-contain object-bottom drop-shadow-[0_22px_28px_rgba(127,29,58,0.22)] ${imageClassName}`}
          style={animationDelay ? { animationDelay } : undefined}
          loading="eager"
        />
        <div className="bottom-[16%] left-1/2 z-20 absolute bg-[linear-gradient(180deg,#ffffff,#ffd9e1_55%,#fd143f)] shadow-[0_10px_18px_rgba(253,20,63,0.16)] rounded-full ring-1 ring-white/80 w-2.5 h-10 -translate-x-1/2" />
        <div className="bottom-[10%] left-1/2 z-30 absolute w-16 sm:w-20 h-8 sm:h-9 -translate-x-1/2">
          <div className="bottom-1.5 absolute inset-x-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.82),rgba(255,247,249,0.96)_42%,rgba(253,20,63,0.14)_100%)] shadow-[0_10px_20px_rgba(253,20,63,0.14)] rounded-t-[36%] rounded-b-[50%] ring-1 ring-white/75 h-4 sm:h-5" />
          <div className="top-0 absolute inset-x-0 bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#fff7f9_48%,rgba(253,20,63,0.16)_78%,rgba(253,20,63,0.04)_100%)] shadow-[inset_0_-4px_8px_rgba(253,20,63,0.07)] rounded-[50%] ring-1 ring-white/85 h-6 sm:h-7" />
          <div className="bottom-2 absolute inset-x-2 bg-white/55 rounded-full h-1.5" />
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>();
  const [query, setQuery] = useState('');

  const { data: productTypes = [], isError: isProductTypesError } = useQuery({
    queryKey: ['product-types'],
    queryFn: () => productTypesService.getAll(),
  });

  const { data: samples = [], isLoading, isError: isSamplesError } = useQuery({
    queryKey: ['samples', selectedTypeId],
    queryFn: () => samplesService.getAll(selectedTypeId),
  });

  const displayProductTypes = productTypes;
  const displaySamples = samples;
  const hasCatalogError = isProductTypesError || isSamplesError;

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
        title="Mẫu ảnh nổi 3D Lenticular"
        description="Khám phá mẫu standee mica, ảnh flip, ảnh depth, thẻ motion và POSM lenticular. Lọc theo danh mục, xem chi tiết và liên hệ tư vấn nhanh."
        canonicalPath="/products"
        image="/img/card00.jpg"
        keywords={['mẫu ảnh nổi 3D', 'mẫu lenticular', 'standee mica mẫu', 'POSM 3D']}
      />

      <section className="relative px-4 pt-8 md:pt-12 pb-8 md:pb-12 overflow-hidden home-creative">
        <div className="top-12 right-[8%] absolute bg-[#8b5cf6]/14 blur-2xl rounded-full w-24 h-24 pointer-events-none" />
        <div className="bottom-8 left-[16%] absolute bg-[#fb923c]/16 blur-2xl rounded-full w-24 h-24 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="lg:items-center gap-6 grid lg:grid-cols-[0.9fr_1.1fr] bg-white/88 shadow-[0_30px_90px_rgba(253,20,63,0.1)] backdrop-blur p-5 md:p-8 border border-primary/10 rounded-[2rem]">
            <div>
              <Badge className="bg-primary/10 hover:bg-primary/10 px-3 py-1.5 rounded-full text-primary">
                <Grid3X3 className="w-3.5 h-3.5" />
                Catalog sản phẩm
              </Badge>
              <h1 className="mt-5 max-w-3xl font-black text-[#9f1239] text-4xl md:text-6xl leading-tight">
                Lọc mẫu theo hiệu ứng, màu sắc và cảm giác 3D.
              </h1>
              <p className="mt-4 max-w-2xl text-[#7f1d3a] text-base leading-7">
                Duyệt các mẫu lenticular theo danh mục, từ khóa và tag. Mỗi mẫu là một hướng nhìn để bắt đầu ý tưởng.
              </p>
              <div className="gap-3 grid sm:grid-cols-3 mt-6 max-w-2xl">
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
                    <span className="-top-8 -right-8 absolute bg-white/45 blur-xl rounded-full w-20 h-20 pointer-events-none" />
                    <div className="relative">
                      <span className={`mb-4 block h-2 w-8 rounded-full ${item.color}`} />
                      <p className="font-black text-[#be123c] text-2xl">{item.value}</p>
                      <p className="mt-1 font-bold text-[#9f1239]/70 text-xs uppercase tracking-[0.18em]">{item.label}</p>
                      <p className="bg-white/72 shadow-sm mt-3 px-2.5 py-1 rounded-full w-fit font-black text-[10px] text-primary uppercase tracking-[0.16em]">
                        {item.effect}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-[radial-gradient(circle_at_20%_18%,rgba(253,20,63,0.12),transparent_26%),radial-gradient(circle_at_82%_22%,rgba(139,92,246,0.16),transparent_24%),linear-gradient(180deg,#ffffff,#fff7f9)] p-6 rounded-[2rem] min-h-[430px] sm:min-h-[500px] overflow-hidden">
              <div className="top-8 left-7 absolute bg-white/80 shadow-[12px_12px_0_rgba(253,20,63,0.08)] border border-primary/12 rounded-2xl w-16 h-16 rotate-[-12deg] pointer-events-none" />
              <div className="right-8 bottom-10 absolute bg-[#fb923c]/18 blur-xl rounded-full w-20 h-20 pointer-events-none" />

              <div className="relative flex justify-center items-end mx-auto max-w-[460px] h-full min-h-[390px] [perspective:900px]">
                <RotatingStandee
                  src="/img/standee2.png"
                  alt="Mẫu standee nhân vật thứ hai"
                  className="bottom-[58px] sm:bottom-[62px] left-[4%] sm:left-[3%] w-[206px] sm:w-[244px] h-[280px] sm:h-[330px]"
                  animationDelay="-1.875s"
                />
                <RotatingStandee
                  src="/img/standee.png"
                  alt="Mẫu standee nhân vật xoay"
                  className="right-[4%] sm:right-[3%] bottom-[58px] sm:bottom-[62px] w-[206px] sm:w-[244px] h-[280px] sm:h-[330px]"
                />

                <div className="top-5 left-3 absolute bg-white/92 shadow-[12px_12px_0_rgba(253,20,63,0.08)] backdrop-blur px-4 py-3 border border-primary/10 rounded-2xl">
                  <Rotate3D className="w-5 h-5 text-primary" />
                  <p className="mt-2 font-black text-[#be123c] text-sm">Ảnh nhân vật xoay 360°</p>
                </div>
                <div className="right-2 bottom-4 absolute bg-white shadow-[0_14px_34px_rgba(139,92,246,0.12)] px-4 py-2 border border-[#8b5cf6]/15 rounded-full font-black text-[#7c3aed] text-xs uppercase tracking-[0.16em]">
                  Đế tròn acrylic
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HolographicSection />
      <FeaturedVideoSection samples={displaySamples} />

      <section className="px-4 pb-14 md:pb-18">
        <div className="gap-6 grid lg:grid-cols-[280px_1fr] mx-auto max-w-7xl">
          <aside className="lg:top-24 lg:sticky bg-white shadow-[0_18px_60px_rgba(253,20,63,0.08)] p-4 border border-primary/10 rounded-[2rem] h-fit">
            <div className="flex items-center gap-2 pb-4 border-primary/10 border-b">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="font-black text-[#9f1239]">Bộ lọc</h2>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label htmlFor="product-search" className="font-bold text-[#7f1d3a] text-sm">Tìm kiếm</label>
                <div className="relative mt-2">
                  <Search className="top-1/2 left-3 absolute w-4 h-4 text-primary/70 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="product-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tên mẫu, tag..."
                    className="bg-[#fff7f9] pl-10 border-primary/15 rounded-xl h-11 text-[#7f1d3a]"
                  />
                </div>
              </div>

              <div>
                <p className="font-bold text-[#7f1d3a] text-sm">Danh mục</p>
                <div className="gap-2 grid mt-2">
                  <Button
                    variant={!selectedTypeId ? 'default' : 'outline'}
                    className="justify-start rounded-xl"
                    onClick={() => setSelectedTypeId(undefined)}
                  >
                    <Filter className="w-4 h-4" />
                    Tất cả mẫu
                  </Button>
                  {displayProductTypes.map((pt) => (
                    <Button
                      key={pt.id}
                      variant={selectedTypeId === pt.id ? 'default' : 'outline'}
                      className="justify-start bg-white hover:bg-primary/5 border-primary/15 rounded-xl text-[#7f1d3a] hover:text-primary"
                      onClick={() => setSelectedTypeId(pt.id)}
                    >
                      {pt.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-primary shadow-[0_18px_48px_rgba(253,20,63,0.18)] p-4 rounded-[1.5rem] text-white">
                <Sparkles className="w-5 h-5" />
                <p className="mt-3 font-bold text-sm">Cần mẫu riêng?</p>
                <p className="mt-1 text-white/84 text-xs leading-5">Gửi ý tưởng để được tư vấn hiệu ứng và chất liệu phù hợp.</p>
                <div className="gap-2 grid mt-4">
                  <Button size="sm" className="bg-white hover:bg-white/95 rounded-xl text-primary" asChild>
                    <a href={SHOP_ZALO_HREF}>
                      <MessageCircle className="w-4 h-4" />
                      Chat Zalo
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white border-white/30 rounded-xl text-white hover:text-primary" asChild>
                    <a href={SHOP_HOTLINE_HREF}>
                      <Phone className="w-4 h-4" />
                      {SHOP_HOTLINE}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3 bg-white shadow-[0_18px_60px_rgba(253,20,63,0.06)] p-4 border border-primary/10 rounded-[2rem]">
              <div>
                <p className="font-black text-[#be123c] text-sm">
                  {activeType ? activeType.name : 'Tất cả sản phẩm'}
                </p>
                <p className="mt-1 text-[#7f1d3a] text-sm">Đang hiển thị {filteredSamples.length} mẫu phù hợp.</p>
              </div>
              <Button variant="outline" className="bg-white hover:bg-primary/5 border-primary/15 rounded-xl text-primary" asChild>
                <Link to="/pricing">
                  Xem bảng giá tham khảo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="sr-only" aria-live="polite">
              Đang hiển thị {filteredSamples.length} mẫu sản phẩm.
            </div>

            {isLoading ? (
              <SkeletonGrid />
            ) : hasCatalogError ? (
              <div className="bg-white py-20 border border-primary/20 border-dashed rounded-[2rem] text-center">
                <Layers3 className="mx-auto w-10 h-10 text-primary" />
                <p className="mt-4 font-black text-[#be123c] text-lg">Chưa tải được dữ liệu</p>
                <p className="mt-2 text-[#7f1d3a] text-sm">Kiểm tra cấu hình Supabase hoặc RLS policy cho dữ liệu public.</p>
              </div>
            ) : filteredSamples.length === 0 ? (
              <div className="bg-white py-20 border border-primary/20 border-dashed rounded-[2rem] text-center">
                <Layers3 className="mx-auto w-10 h-10 text-primary" />
                <p className="mt-4 font-black text-[#be123c] text-lg">Chưa có mẫu phù hợp</p>
                <p className="mt-2 text-[#7f1d3a] text-sm">Thử đổi từ khóa hoặc chọn lại danh mục sản phẩm.</p>
              </div>
            ) : (
              <div className="gap-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
