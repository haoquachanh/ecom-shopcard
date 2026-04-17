import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productTypesApi, samplesApi } from '@/api/products.api';
import { SEOHead } from '@/components/common/SEOHead';
import { SampleCard } from '@/components/product/SampleCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SHOP_HOTLINE, SHOP_HOTLINE_HREF, SHOP_ZALO_HREF } from '@/lib/site';
import {
  ArrowRight,
  Filter,
  Grid3X3,
  Layers3,
  MessageCircle,
  Phone,
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

  const filteredSamples = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return samples;

    return samples.filter((sample) =>
      [sample.name, sample.description, sample.tags?.join(' '), sample.productType?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [query, samples]);

  const activeType = productTypes.find((type) => type.id === selectedTypeId);

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
          <div className="grid gap-6 rounded-[2rem] border border-primary/10 bg-white/88 p-5 shadow-[0_30px_90px_rgba(253,20,63,0.1)] backdrop-blur md:p-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-end">
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
            </div>

            <div className="grid gap-3 rounded-[1.5rem] bg-[#fff7f9] p-3 sm:grid-cols-3">
              {[
                { label: 'Danh mục', value: productTypes.length, color: 'bg-primary' },
                { label: 'Mẫu phù hợp', value: filteredSamples.length, color: 'bg-[#8b5cf6]' },
                { label: 'Hỗ trợ', value: 'Zalo', color: 'bg-[#fb923c]' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-4 ring-1 ring-primary/10">
                  <span className={`mb-4 block h-2 w-8 rounded-full ${item.color}`} />
                  <p className="text-2xl font-black text-[#be123c]">{item.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#9f1239]/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                  {productTypes.map((pt) => (
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
