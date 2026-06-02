import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLovedStore } from '@/stores/loved.store';
import { ArrowRight, Heart, Layers3, ShoppingBag, Trash2 } from 'lucide-react';

export default function Loved() {
  const { items, removeLoved, clearLoved } = useLovedStore();

  return (
    <>
      <SEOHead
        title="Sản phẩm yêu thích"
        description="Danh sách mẫu ảnh nổi 3D bạn đã lưu để tham khảo."
        canonicalPath="/loved"
        noindex
      />

      <section className="home-creative relative overflow-hidden px-4 pb-8 pt-8 md:pb-12 md:pt-12">
        <div className="pointer-events-none absolute right-[12%] top-12 h-24 w-24 rounded-full bg-[#8b5cf6]/14 blur-2xl" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 rounded-[2rem] border border-primary/10 bg-white/88 p-6 shadow-[0_30px_90px_rgba(253,20,63,0.1)] backdrop-blur md:grid-cols-[1fr_auto] md:items-end md:p-8">
            <div>
              <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
                <Heart className="h-3.5 w-3.5" />
                Loved
              </Badge>
              <h1 className="display-heading mt-5 text-4xl font-black text-[#9f1239] md:text-6xl">Bộ sưu tập yêu thích.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#7f1d3a]">
                Lưu những mẫu có hiệu ứng, màu sắc và cảm giác 3D phù hợp để quay lại tham khảo nhanh hơn.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl border-primary/15 bg-white text-primary hover:bg-primary/5" asChild>
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Xem sản phẩm
                </Link>
              </Button>
              <Button variant="ghost" className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={clearLoved} disabled={items.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa tất cả
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {items.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-12 text-center shadow-[0_22px_60px_rgba(253,20,63,0.08)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#be123c]">Chưa có mẫu yêu thích</h2>
              <p className="mt-2 text-sm text-[#7f1d3a]">Bấm biểu tượng tim trên sản phẩm để lưu lại tại đây.</p>
              <Button className="mt-6 rounded-xl border-0 bg-primary text-white shadow-[0_18px_38px_rgba(253,20,63,0.2)] hover:bg-primary/90" asChild>
                <Link to="/products">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden rounded-[2rem] border-primary/10 bg-white shadow-[0_18px_50px_rgba(253,20,63,0.08)]">
                  <div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr]">
                    <img
                      src={item.thumbnailUrl || item.imageUrl || 'https://placehold.co/300x300/fff1f4/fd143f?text=Loved'}
                      alt={item.name}
                      className="h-32 w-full rounded-[1.5rem] object-cover sm:h-full"
                    />
                    <CardContent className="flex flex-col justify-between p-0">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{item.productTypeName || 'Sản phẩm'}</p>
                        <h3 className="mt-2 text-lg font-black leading-snug text-[#be123c]">{item.name}</h3>
                        <p className="mt-2 line-clamp-3 text-sm text-[#7f1d3a]">{item.description || 'Mẫu sản phẩm đã được lưu vào danh sách yêu thích.'}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" className="rounded-xl bg-primary text-white hover:bg-primary/90" asChild>
                          <Link to={`/product-detail/${item.slug}`}>Xem chi tiết</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-xl border-primary/15 bg-white text-primary hover:bg-primary/5" onClick={() => removeLoved(item.id)}>
                          Bỏ lưu
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-14">
        <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-[2rem] bg-[#fff7f9] p-5 text-[#7f1d3a]">
          <Layers3 className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
          <p className="text-sm font-semibold">Mẹo: lưu các mẫu có layer, màu và hiệu ứng khác nhau để dễ so sánh khi trao đổi ý tưởng.</p>
        </div>
      </section>
    </>
  );
}
