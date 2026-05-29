import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SHOP_HOTLINE, SHOP_HOTLINE_HREF, SHOP_NAME, SHOP_SERVICE_LINE, SHOP_TAGLINE, SHOP_ZALO_HREF } from '@/lib/site';
import { productTypesService } from '@/services/products.service';
import { formatCompactVnd, pricingService, type ActivePriceTable } from '@/services/pricing.service';
import { ArrowRight, BadgeCheck, CircleDollarSign, Layers3, MessageCircle, Phone, Sparkles } from 'lucide-react';

const pricingHighlights = [
  { title: 'Mẫu cơ bản', price: 'Từ 100.000đ', note: 'Phù hợp số lượng nhỏ, quà tặng, thử mẫu.', accent: 'from-primary to-[#fb7185]' },
  { title: 'Mẫu thương hiệu', price: 'Tư vấn theo yêu cầu', note: 'Dành cho chiến dịch, sự kiện, nhận diện thương hiệu.', accent: 'from-[#8b5cf6] to-primary' },
  { title: 'Sản xuất số lượng', price: 'Chiết khấu tốt', note: 'Ưu tiên theo số lượng và mức độ tuỳ biến.', accent: 'from-[#fb923c] to-primary' },
];

const serviceRows = [
  ['In lenticular', 'Theo kích thước và số lượng'],
  ['Thiết kế mẫu', 'Có thể hỗ trợ dựng nội dung'],
  ['Tư vấn vật liệu', 'Chọn loại phù hợp nhu cầu'],
  ['Giao nhận', 'Hỗ trợ nội thành và toàn quốc'],
];

function PublicPriceMatrix({ table }: { table: ActivePriceTable }) {
  const matrix = table.matrix;
  if (!matrix) return null;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-primary/10 bg-white shadow-[0_18px_48px_rgba(253,20,63,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fff7f9] px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{table.productType?.name}</p>
          <h2 className="mt-1 text-xl font-black text-[#9f1239]">{matrix.title}</h2>
        </div>
        <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">v{table.priceTable.version}</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[620px] w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-primary px-4 py-3 text-left font-black text-white">{matrix.quantityLabel}</th>
              {matrix.columns.map((column) => (
                <th key={column.id ?? 'base'} className="border-b border-primary/10 bg-white px-4 py-3 text-center font-black text-[#be123c]">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row.id}>
                <th className="sticky left-0 z-10 border-t border-white/20 bg-primary px-4 py-3 text-left font-black text-white">
                  {row.label}
                </th>
                {row.cells.map((cell) => (
                  <td key={`${row.id}-${cell.columnValueId ?? 'base'}`} className="border-t border-primary/10 px-4 py-3 text-center">
                    <strong className="text-lg font-black text-[#be123c]">{formatCompactVnd(cell.priceVnd)}/c</strong>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {matrix.notes ? <p className="border-t border-primary/10 bg-[#fff7f9] px-5 py-4 text-sm font-semibold leading-6 text-[#7f1d3a]">{matrix.notes}</p> : null}
    </div>
  );
}

export default function PriceList() {
  const { data: priceTables = [] } = useQuery({
    queryKey: ['public-price-tables'],
    queryFn: async () => {
      const productTypes = await productTypesService.getAll();
      const tables = await Promise.all(productTypes.map((type) => pricingService.getActivePriceTable(type.slug)));
      return tables.filter(Boolean) as ActivePriceTable[];
    },
  });

  return (
    <>
      <SEOHead
        title="Bảng giá ảnh nổi 3D Lenticular"
        description="Bảng giá tham khảo cho in ảnh nổi 3D lenticular, standee mica, thiết kế mẫu và sản xuất POSM theo kích thước, số lượng, hiệu ứng."
        canonicalPath="/pricing"
        image="/img/card01.jpg"
        keywords={['bảng giá ảnh nổi 3D', 'giá in lenticular', 'giá standee mica']}
      />

      <section className="home-creative relative overflow-hidden px-4 pt-10 pb-12 md:pt-14">
        <div className="pointer-events-none absolute left-[5%] top-20 h-24 w-24 rotate-[-12deg] rounded-[2rem] border border-primary/15 bg-white/70 shadow-[22px_20px_0_rgba(253,20,63,0.1)] home-float-slow" />
        <div className="pointer-events-none absolute right-[10%] top-28 h-28 w-28 rounded-full bg-[#8b5cf6]/15 blur-2xl home-float" />
        <div className="pointer-events-none absolute bottom-8 left-[42%] h-32 w-32 rounded-full bg-[#fb923c]/15 blur-3xl" />

        <div className="container relative mx-auto grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge className="rounded-full border border-primary/15 bg-white px-4 py-2 text-primary shadow-[0_12px_28px_rgba(253,20,63,0.12)] hover:bg-white">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Bảng giá minh bạch
            </Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-normal text-[#9f1239] md:text-6xl">
              Giá linh hoạt theo ý tưởng, số lượng và hiệu ứng.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#7f1d3a]/80">
              {SHOP_TAGLINE} {SHOP_SERVICE_LINE}. Mỗi mẫu 3D lenticular có mức độ layer, vật liệu và quy cách khác nhau nên bảng giá này dùng để tham khảo nhanh trước khi trao đổi chi tiết.
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
              {pricingHighlights.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-primary/10 bg-white/85 p-4 shadow-[0_18px_44px_rgba(253,20,63,0.08)] backdrop-blur">
                  <div className={`h-2 w-10 rounded-full bg-gradient-to-r ${item.accent}`} />
                  <p className="mt-4 text-lg font-black text-[#be123c]">{item.price}</p>
                  <p className="mt-1 text-sm font-bold text-[#9f1239]">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#7f1d3a]/70">{item.note}</p>
                </div>
              ))}
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
                    <p className="text-xs font-black uppercase tracking-[0.32em] text-primary">Ước tính</p>
                    <h2 className="mt-2 text-2xl font-black text-[#9f1239]">Khung báo giá</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CircleDollarSign className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
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
                      <Sparkles className="h-4 w-4 shrink-0 text-[#fb923c]" />
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
        {priceTables.length > 0 ? (
          <div className="container mx-auto mb-8 grid gap-5">
            <div className="max-w-3xl">
              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Bảng giá đang áp dụng
              </Badge>
              <h2 className="mt-4 text-3xl font-black text-[#9f1239]">Bảng giá public theo loại sản phẩm.</h2>
            </div>
            {priceTables.map((table) => (
              <PublicPriceMatrix key={table.priceTable.id} table={table} />
            ))}
          </div>
        ) : null}

        <div className="container mx-auto rounded-[2rem] border border-primary/10 bg-white px-6 py-8 shadow-[0_24px_70px_rgba(253,20,63,0.08)] md:px-10">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                <Layers3 className="mr-2 h-3.5 w-3.5" />
                Ghi chú báo giá
              </Badge>
              <h2 className="mt-4 text-3xl font-black text-[#9f1239]">Xem mẫu trước, chốt thông số sau.</h2>
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
