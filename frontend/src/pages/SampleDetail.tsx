import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatVND } from '@/lib/utils';
import { SHOP_ZALO_HREF } from '@/lib/site';
import { MessageCircle, Minus, Plus } from 'lucide-react';
import { pricingService, unitPriceForQuantity } from '@/services/pricing.service';
import { samplesService } from '@/services/products.service';

export default function SampleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: sample, isLoading, isError } = useQuery({
    queryKey: ['sample', slug],
    queryFn: () => samplesService.getBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });

  const [selectedMaterialId, setSelectedMaterialId] = useState<number | undefined>();
  const [selectedSizeId, setSelectedSizeId] = useState<number | undefined>();
  const [selectedSideId, setSelectedSideId] = useState<number | undefined>();
  const [selectedEffectId, setSelectedEffectId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(20);

  const { data: priceConfigs = [], isLoading: isPricingLoading, isError: isPricingError } = useQuery({
    queryKey: ['base-prices', sample?.productTypeId],
    queryFn: () => pricingService.getBasePrices(sample!.productTypeId),
    enabled: !!sample?.productTypeId,
  });

  const options = pricingService.getOptions(priceConfigs);

  useEffect(() => {
    if (options.materials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(options.materials[0].id);
    }
    if (options.sizes.length > 0 && !selectedSizeId) {
      setSelectedSizeId(options.sizes[0].id);
    }
    if (options.sides.length > 0 && !selectedSideId) {
      setSelectedSideId(options.sides[0].id);
    }
  }, [options.materials, options.sizes, options.sides, selectedMaterialId, selectedSideId, selectedSizeId]);

  const activePrice = pricingService.findConfig(
    priceConfigs,
    sample?.productTypeId || 0,
    selectedMaterialId,
    selectedSizeId,
    selectedSideId,
    selectedEffectId,
  );

  const unitPrice = unitPriceForQuantity(activePrice, quantity);
  const subtotal = unitPrice * quantity;

  if (isLoading) return (
    <div className="mx-auto px-4 py-10 container">
      <div className="gap-8 grid md:grid-cols-2">
        <Skeleton className="rounded-2xl aspect-square" />
        <div className="space-y-4"><Skeleton className="w-3/4 h-8" /><Skeleton className="w-full h-4" /><Skeleton className="w-full h-4" /></div>
      </div>
    </div>
  );

  if (isError || !sample) return <div className="mx-auto px-4 py-20 text-center container"><p>Không tìm thấy mẫu</p></div>;

  return (
    <>
      <SEOHead
        title={`${sample.name} - Báo giá mẫu 3D Lenticular`}
        description={sample.description || 'Chi tiết mẫu và bảng giá tham khảo cho ảnh nổi 3D lenticular.'}
        canonicalPath={`/samples/${sample.slug}`}
        image={sample.imageUrl || sample.thumbnailUrl || '/img/logo.jpg'}
        type="product"
        noindex
      />
      <div className="mx-auto px-4 py-8 container">
        <div className="gap-8 lg:gap-12 grid md:grid-cols-2">
          {/* Image */}
          <div className="space-y-3">
            <div className="bg-muted rounded-2xl aspect-square overflow-hidden">
              <img src={sample.imageUrl || sample.thumbnailUrl || 'https://placehold.co/600x600'} alt={sample.name} className="w-full h-full object-cover" />
            </div>
            {sample.images && sample.images.length > 0 && (
              <div className="flex gap-2 pb-1 overflow-x-auto">
                {sample.images.map((img) => (
                  <img key={img.id} src={img.imageUrl} alt="" className="border-2 border-transparent hover:border-primary rounded-lg w-16 h-16 object-cover cursor-pointer shrink-0" />
                ))}
              </div>
            )}
          </div>

          {/* Info + Reference calculator */}
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground text-sm uppercase tracking-wide">{sample.productType?.name}</p>
              <h1 className="mt-1 font-bold text-2xl md:text-3xl">{sample.name}</h1>
              {sample.tags && <div className="flex flex-wrap gap-1.5 mt-3">{sample.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>}
              {sample.description && <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{sample.description}</p>}
            </div>

            {isPricingLoading && (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            )}

            {isPricingError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                Chưa tải được bảng giá public. Kiểm tra RLS policy cho base_prices và quantity_tiers.
              </div>
            )}

            {/* Material */}
            {options.materials.length > 0 && (
              <div>
                <p className="mb-2 font-medium text-sm">Chất liệu</p>
                <Select value={selectedMaterialId ? String(selectedMaterialId) : undefined} onValueChange={(value) => setSelectedMaterialId(Number(value))}>
                  <SelectTrigger><SelectValue placeholder="Chọn chất liệu" /></SelectTrigger>
                  <SelectContent>
                    {options.materials.map((material) => (
                      <SelectItem key={material.id} value={String(material.id)}>{material.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Size */}
            {options.sizes.length > 0 && (
              <div>
                <p className="mb-2 font-medium text-sm">Kích thước</p>
                <div className="flex flex-wrap gap-2">
                  {options.sizes.map((size) => (
                    <button key={size.id}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedSizeId === size.id ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setSelectedSizeId(size.id)}>
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {options.sides.length > 1 && (
              <div>
                <p className="mb-2 font-medium text-sm">Mặt in</p>
                <div className="flex flex-wrap gap-2">
                  {options.sides.map((side) => (
                    <button key={side.id}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedSideId === side.id ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setSelectedSideId(side.id)}>
                      {side.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {options.effects.length > 0 && (
              <div>
                <p className="mb-2 font-medium text-sm">Hiệu ứng</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedEffectId === null ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                    onClick={() => setSelectedEffectId(null)}
                  >
                    Không chọn
                  </button>
                  {options.effects.map((effect) => (
                    <button key={effect.id}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedEffectId === effect.id ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setSelectedEffectId(effect.id)}>
                      {effect.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="mb-2 font-medium text-sm">Số lượng</p>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 10))}><Minus className="w-4 h-4" /></Button>
                <input type="number" min={1} value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-20 h-10 text-sm text-center" />
                <Button size="icon" variant="outline" onClick={() => setQuantity(quantity + 10)}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Price summary */}
            <div className="space-y-2 bg-muted/50 p-4 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đơn giá</span>
                <span>{unitPrice > 0 ? formatVND(unitPrice) : '--'} × {quantity}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">{subtotal > 0 ? formatVND(subtotal) : '--'}</span>
              </div>
            </div>

            <Button size="lg" className="border-0 w-full font-semibold text-white gradient-brand" asChild>
              <a href={SHOP_ZALO_HREF}>
                <MessageCircle className="mr-2 w-5 h-5" />Trao đổi về mẫu này
              </a>
            </Button>
          </div>
        </div>

        {/* Price grid table */}
        {activePrice && activePrice.quantityTiers.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-semibold text-lg">Bảng giá tham khảo</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left">Số lượng</th>
                    <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {activePrice.quantityTiers.map((tier) => (
                    <tr key={tier.id} className={`border-t ${quantity >= tier.minQuantity && (tier.maxQuantity === null || quantity <= tier.maxQuantity) ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 font-medium">
                        {tier.minQuantity}
                        {tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'} cái
                      </td>
                      <td className="px-4 py-3 text-right">{formatVND(tier.pricePerUnit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
