import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getSupabaseClient } from '@/lib/supabase';
import { SHOP_HOTLINE, SHOP_HOTLINE_HREF, SHOP_SERVICE_LINE, SHOP_TAGLINE, SHOP_ZALO_HREF } from '@/lib/site';
import { formatCompactVnd, pricingService, type ActivePriceTable } from '@/services/pricing.service';
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Info,
  Layers3,
  MessageCircle,
  Phone,
  ReceiptText,
  Sparkles,
  Table2,
} from 'lucide-react';

const pricingHighlights = [
  { title: 'Theo bảng active', text: 'Dữ liệu lấy trực tiếp từ bảng giá đã publish trong admin.', icon: Table2, color: 'bg-primary/10 text-primary' },
  { title: 'Theo số lượng', text: 'Mỗi dòng giá bám đúng mốc số lượng hoặc khoảng số lượng đã cấu hình.', icon: Layers3, color: 'bg-[#8b5cf6]/10 text-[#7c3aed]' },
  { title: 'Có ghi chú phụ phí', text: 'Các dòng FREE, phụ phí theo cái hoặc phí cố định hiển thị cùng bảng.', icon: ReceiptText, color: 'bg-[#fb923c]/12 text-[#ea580c]' },
];

const serviceRows = [
  ['Nguồn dữ liệu', 'Bảng giá active từ admin'],
  ['Đơn vị', 'Theo unit label trong từng bảng'],
  ['Phụ phí', 'Hiển thị đúng ghi chú preview'],
  ['Tư vấn', 'Chốt giá cuối qua Zalo/hotline'],
];

function getUnitSuffix(unitLabel: string) {
  const normalized = unitLabel.trim();
  if (!normalized) return '';
  if (normalized.includes('/')) return `/${normalized.split('/').pop()}`;
  if (/^(c|cái|sp|sản phẩm)$/i.test(normalized)) return `/${normalized}`;
  return '';
}

function formatPrice(value: number | null, unitLabel: string, pricingMode?: string) {
  if (pricingMode === 'quote_required') return 'Tư vấn';
  if (value == null) return 'Trống';
  if (pricingMode === 'fixed_total') return formatCompactVnd(value);
  return `${formatCompactVnd(value)}${getUnitSuffix(unitLabel)}`;
}

function noteLines(notes?: string | null) {
  return notes?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) ?? [];
}

function PublicPriceMatrix({ table, featured = false }: { table: ActivePriceTable; featured?: boolean }) {
  const matrix = table.matrix;
  if (!matrix) return null;
  const hasSinglePriceColumn = matrix.columns.length === 1;
  const extraCharges = matrix.extraCharges.filter((charge) => charge.chargeType === 'free' || charge.priceVnd > 0);
  const notes = noteLines(matrix.notes);

  return (
    <article className={`overflow-hidden rounded-[2rem] border bg-white shadow-[0_24px_70px_rgba(253,20,63,0.08)] ${featured ? 'border-primary/25' : 'border-primary/10'}`}>
      <div className="relative overflow-hidden bg-[#fff7f9] px-5 py-5 md:px-7">
        <div className="pointer-events-none absolute right-6 top-4 h-20 w-20 rounded-full bg-[#8b5cf6]/14 blur-2xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge className="rounded-full bg-white px-3 py-1.5 text-primary shadow-sm hover:bg-white">
              {table.productType?.name || 'Lenti Lab'}
            </Badge>
            <h2 className="display-heading mt-4 text-3xl font-black text-[#9f1239] md:text-4xl">{matrix.title}</h2>
            {matrix.subtitle ? <p className="mt-2 text-sm leading-6 text-[#7f1d3a]/78">{matrix.subtitle}</p> : null}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 md:p-6">
        {matrix.groups.map((group) => (
          <section key={group.id ?? 'base'} className="rounded-[1.5rem] border border-primary/10 bg-white">
            {group.id != null ? (
              <div className="border-b border-primary/10 px-4 py-4">
                <h3 className="text-xl font-black text-[#9f1239]">{group.label}</h3>
                {group.note ? <p className="mt-1 text-sm text-[#7f1d3a]/70">{group.note}</p> : null}
              </div>
            ) : null}
            {hasSinglePriceColumn ? (
              <>
                <div className="grid grid-cols-[1fr_auto] gap-4 rounded-t-[1.5rem] bg-[#fff7f9] px-4 py-3 text-sm font-black text-[#9f1239]">
                  <span>{matrix.quantityLabel}</span>
                  <span>{matrix.columns[0]?.label || matrix.priceLabel}</span>
                </div>
                <div className="divide-y divide-primary/10">
                  {matrix.rows.map((row) => {
                    const cell = row.cells.find((item) => item.groupValueId === group.id && item.columnValueId === matrix.columns[0]?.id);
                    return (
                      <div key={row.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4">
                        <div>
                          <p className="font-black text-[#9f1239]">{row.label}</p>
                          {row.rangeLabel !== row.label ? <p className="mt-0.5 text-xs font-semibold text-[#7f1d3a]/60">{row.rangeLabel}</p> : null}
                        </div>
                        <strong className="rounded-full bg-[#fff1f4] px-4 py-2 text-lg font-black text-primary">
                          {formatPrice(cell?.priceVnd ?? null, matrix.unitLabel, cell?.pricingMode)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 border-b border-primary/10 bg-[#fff7f9] px-4 py-4 text-left font-black text-[#9f1239]">{matrix.quantityLabel}</th>
                      {matrix.columns.map((column) => (
                        <th key={column.id ?? 'base'} className="border-b border-primary/10 bg-[#fff7f9] px-4 py-4 text-center font-black text-[#9f1239]">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.rows.map((row) => (
                      <tr key={row.id}>
                        <th className="sticky left-0 z-10 border-t border-primary/10 bg-white px-4 py-4 text-left text-[#9f1239]">
                          <span className="block text-lg font-black">{row.label}</span>
                          {row.rangeLabel !== row.label ? <span className="mt-1 block text-xs font-semibold text-[#7f1d3a]/60">{row.rangeLabel}</span> : null}
                        </th>
                        {matrix.columns.map((column) => {
                          const cell = row.cells.find((item) => item.groupValueId === group.id && item.columnValueId === column.id);
                          return (
                            <td key={`${row.id}-${group.id ?? 'base'}-${column.id ?? 'base'}`} className="border-t border-primary/10 bg-white px-4 py-4 text-center">
                              <strong className="text-lg font-black text-[#be123c]">{formatPrice(cell?.priceVnd ?? null, matrix.unitLabel, cell?.pricingMode)}</strong>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {extraCharges.length > 0 || notes.length > 0 ? (
          <div className="mt-4 rounded-[1.5rem] border border-primary/10 bg-[#fff7f9] p-4">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Info className="h-4 w-4" />
              <p className="text-sm font-black">Ghi chú từ bảng giá preview</p>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-[#7f1d3a]">
              {extraCharges.map((charge) => (
                <li key={charge.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span>- {charge.name}</span>
                  <mark className="w-fit rounded-full bg-white px-3 py-1 font-black text-primary">
                    {charge.chargeType === 'free' ? 'FREE' : `+${formatCompactVnd(charge.priceVnd)}${charge.isPerItem ? getUnitSuffix(matrix.unitLabel) : ''}`}
                  </mark>
                </li>
              ))}
              {notes.map((line, index) => (
                <li key={`${line}-${index}`}>- {line}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function PricingSkeleton() {
  return (
    <div className="container mx-auto grid gap-5">
      {[0, 1].map((item) => (
        <div key={item} className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-[0_24px_70px_rgba(253,20,63,0.08)]">
          <Skeleton className="h-7 w-44 rounded-full" />
          <Skeleton className="mt-5 h-10 w-2/3 rounded-2xl" />
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function listActivePriceTableSlugs() {
  const supabase = getSupabaseClient();
  const fallback = await supabase
    .from('public_active_product_types')
    .select('slug')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (fallback.error) {
    console.warn('Public product type index could not be loaded.', fallback.error);
    return ['card-giay'];
  }

  const publicSlugs = ((fallback.data || []) as Array<{ slug: string | null }>)
    .map((row) => row.slug)
    .filter((slug): slug is string => Boolean(slug));

  return Array.from(new Set([...publicSlugs, 'card-giay']));
}

export default function PriceList() {
  const [selectedTableId, setSelectedTableId] = useState<number | 'all'>('all');
  const {
    data: priceTables = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-price-tables', 'active-index-v2'],
    queryFn: async () => {
      const slugs = await listActivePriceTableSlugs();
      const results = await Promise.allSettled(
        slugs.map(async (slug) => ({
          slug,
          table: await pricingService.getActivePriceTable(slug),
        })),
      );

      const failedTables = results.filter((result) => result.status === 'rejected');
      if (failedTables.length > 0) {
        console.warn('Some public price tables could not be loaded.', failedTables);
      }

      const loadedTables = results
        .filter((result): result is PromiseFulfilledResult<{ slug: string; table: ActivePriceTable | null }> => result.status === 'fulfilled')
        .map((result) => result.value.table)
        .filter((table): table is ActivePriceTable => Boolean(table?.matrix));

      if (loadedTables.length > 0) return loadedTables;

      const cardPaperTable = await pricingService.getActivePriceTable('card-giay');
      return cardPaperTable?.matrix ? [cardPaperTable] : [];
    },
  });

  const selectedTables = useMemo(() => {
    if (selectedTableId === 'all') return priceTables;
    return priceTables.filter((table) => table.priceTable.id === selectedTableId);
  }, [priceTables, selectedTableId]);

  const tableCount = priceTables.length;
  const rowCount = priceTables.reduce((total, table) => total + (table.matrix?.rows.length ?? 0), 0);
  const hasData = priceTables.length > 0;

  return (
    <>
      <SEOHead
        title="Bảng giá ảnh nổi 3D Lenticular"
        description="Bảng giá tham khảo cho in ảnh nổi 3D lenticular, standee mica, thiết kế mẫu và sản xuất POSM theo kích thước, số lượng, hiệu ứng."
        canonicalPath="/pricing"
        image="/img/card01.jpg"
        keywords={['bảng giá ảnh nổi 3D', 'giá in lenticular', 'giá standee mica']}
      />

      <section className="home-creative relative overflow-hidden px-4 pb-12 pt-10 md:pt-14">
        <div className="pointer-events-none absolute left-[5%] top-20 h-24 w-24 rotate-[-12deg] rounded-[2rem] border border-primary/15 bg-white/70 shadow-[22px_20px_0_rgba(253,20,63,0.1)] home-float-slow" />
        <div className="pointer-events-none absolute right-[10%] top-28 h-28 w-28 rounded-full bg-[#8b5cf6]/15 blur-2xl home-float" />
        <div className="pointer-events-none absolute bottom-8 left-[42%] h-32 w-32 rounded-full bg-[#fb923c]/15 blur-3xl" />

        <div className="container relative mx-auto grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge className="rounded-full border border-primary/15 bg-white px-4 py-2 text-primary shadow-[0_12px_28px_rgba(253,20,63,0.12)] hover:bg-white">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Bảng giá public từ admin
            </Badge>
            <h1 className="display-heading mt-6 max-w-3xl text-4xl font-black text-[#9f1239] md:text-6xl">
              Bảng giá ảnh nổi 3D rõ ràng theo từng loại sản phẩm.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#7f1d3a]/80">
              {SHOP_TAGLINE} {SHOP_SERVICE_LINE}. Giá bên dưới được lấy từ bảng giá active trong database và trình bày đúng theo preview đã publish ở admin.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl bg-primary px-7 text-white shadow-[0_18px_38px_rgba(253,20,63,0.28)] hover:bg-primary/90">
                <Link to="/products">
                  Xem mẫu sản phẩm <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl border-primary/20 bg-white px-7 text-primary shadow-sm hover:bg-primary/5">
                <a href={SHOP_ZALO_HREF}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Tư vấn Zalo
                </a>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {pricingHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-primary/10 bg-white/85 p-4 shadow-[0_18px_44px_rgba(253,20,63,0.08)] backdrop-blur">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-black text-[#be123c]">{item.title}</p>
                    <p className="mt-2 text-xs leading-5 text-[#7f1d3a]/70">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -right-4 top-8 h-28 w-28 rounded-full bg-[#8b5cf6]/25 blur-2xl" />
            <div className="absolute -bottom-6 left-4 h-28 w-28 rounded-full bg-[#fb923c]/25 blur-2xl" />
            <div className="home-tilt-card relative overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_30px_90px_rgba(253,20,63,0.16)]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(253,20,63,0.08)_1px,transparent_1px)] bg-[length:16px_100%] opacity-70" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.32em] text-primary">Tổng quan</p>
                    <h2 className="mt-2 text-2xl font-black text-[#9f1239]">Bảng giá đang áp dụng</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CircleDollarSign className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-[0_12px_28px_rgba(253,20,63,0.06)]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Bảng active</p>
                    <p className="mt-2 text-4xl font-black text-[#be123c]">{isLoading ? '-' : tableCount}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-[0_12px_28px_rgba(253,20,63,0.06)]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Mốc giá</p>
                    <p className="mt-2 text-4xl font-black text-[#be123c]">{isLoading ? '-' : rowCount}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {serviceRows.map(([name, value], index) => (
                    <div key={name} className="flex items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-[0_12px_28px_rgba(253,20,63,0.06)]">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${index % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-[#8b5cf6]/10 text-[#7c3aed]'}`}>
                          <BadgeCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#9f1239]">{name}</p>
                          <p className="text-sm text-[#7f1d3a]/70">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-r from-primary via-[#ff4d6d] to-[#fb923c] p-5 text-white shadow-[0_18px_42px_rgba(253,20,63,0.22)]">
                  <p className="text-sm font-semibold text-white/85">Hotline tư vấn</p>
                  <a href={SHOP_HOTLINE_HREF} className="mt-1 flex items-center gap-2 text-2xl font-black">
                    <Phone className="h-5 w-5" />
                    {SHOP_HOTLINE}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        {isLoading ? <PricingSkeleton /> : null}

        {!isLoading && isError ? (
          <div className="container mx-auto rounded-[2rem] border border-destructive/20 bg-white p-10 text-center shadow-[0_24px_70px_rgba(253,20,63,0.08)]">
            <Layers3 className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-2xl font-black text-[#9f1239]">Chưa tải được bảng giá</h2>
            <p className="mt-2 text-sm leading-6 text-[#7f1d3a]/75">Kiểm tra Supabase RPC get_active_price_table, RLS public hoặc kết nối database.</p>
          </div>
        ) : null}

        {!isLoading && !isError && !hasData ? (
          <div className="container mx-auto rounded-[2rem] border border-dashed border-primary/20 bg-white p-10 text-center shadow-[0_24px_70px_rgba(253,20,63,0.08)]">
            <Table2 className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-2xl font-black text-[#9f1239]">Chưa có bảng giá public</h2>
            <p className="mt-2 text-sm leading-6 text-[#7f1d3a]/75">Hãy publish ít nhất một bảng giá active trong admin để hiển thị tại đây.</p>
          </div>
        ) : null}

        {!isLoading && !isError && hasData ? (
          <div className="container mx-auto grid gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                  Bảng giá đang áp dụng
                </Badge>
                <h2 className="display-heading mt-4 text-3xl font-black text-[#9f1239] md:text-5xl">Chọn loại sản phẩm để xem giá.</h2>
                <p className="mt-3 text-sm leading-7 text-[#7f1d3a]/75">
                  Các bảng dưới đây dùng cùng cấu trúc với preview admin: dòng là mốc số lượng, cột là tùy chọn sản phẩm, ghi chú là phụ phí hoặc điều kiện đi kèm.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-2xl border-primary/20 bg-white px-6 text-primary hover:bg-primary/5">
                <a href={SHOP_ZALO_HREF}>
                  <MessageCircle className="h-4 w-4" />
                  Gửi cấu hình cần báo giá
                </a>
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Chọn bảng giá theo loại sản phẩm">
              <button
                type="button"
                className={`h-11 shrink-0 rounded-full px-4 text-sm font-black transition-colors ${selectedTableId === 'all' ? 'bg-primary text-white shadow-[0_12px_26px_rgba(253,20,63,0.18)]' : 'border border-primary/15 bg-white text-[#7f1d3a] hover:bg-primary/5 hover:text-primary'}`}
                onClick={() => setSelectedTableId('all')}
              >
                Tất cả bảng giá
              </button>
              {priceTables.map((table) => (
                <button
                  key={table.priceTable.id}
                  type="button"
                  className={`h-11 shrink-0 rounded-full px-4 text-sm font-black transition-colors ${selectedTableId === table.priceTable.id ? 'bg-primary text-white shadow-[0_12px_26px_rgba(253,20,63,0.18)]' : 'border border-primary/15 bg-white text-[#7f1d3a] hover:bg-primary/5 hover:text-primary'}`}
                  onClick={() => setSelectedTableId(table.priceTable.id)}
                >
                  {table.productType?.name || table.priceTable.name}
                </button>
              ))}
            </div>

            <div className="grid gap-6">
              {selectedTables.map((table, index) => (
                <PublicPriceMatrix key={table.priceTable.id} table={table} featured={index === 0} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="container mx-auto mt-8 rounded-[2rem] border border-primary/10 bg-white px-6 py-8 shadow-[0_24px_70px_rgba(253,20,63,0.08)] md:px-10">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                <Layers3 className="mr-2 h-3.5 w-3.5" />
                Ghi chú báo giá
              </Badge>
              <h2 className="display-heading mt-4 text-3xl font-black text-[#9f1239]">Xem mẫu trước, chốt thông số sau.</h2>
              <p className="mt-3 text-sm leading-7 text-[#7f1d3a]/75">
                Giá cuối cùng phụ thuộc vào kích thước, số lượng, độ phức tạp hình ảnh, hiệu ứng chuyển góc và thời gian hoàn thiện. Cách nhanh nhất là chọn mẫu gần giống nhu cầu rồi gửi qua Zalo.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild className="h-14 rounded-2xl bg-primary text-white hover:bg-primary/90">
                <Link to="/products">Xem sản phẩm</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-2xl border-primary/20 bg-white text-primary hover:bg-primary/5">
                <a href={SHOP_HOTLINE_HREF}>Gọi tư vấn</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
