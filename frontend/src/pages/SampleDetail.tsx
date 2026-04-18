import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { samplesApi, priceGridsApi } from '@/api/products.api';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatVND } from '@/lib/utils';
import { lookupUnitPrice } from '@/lib/price.utils';
import { SHOP_ZALO_HREF } from '@/lib/site';
import { MessageCircle, Minus, Plus } from 'lucide-react';
import type { PriceTier, ExtraCharge, PriceGrid } from '@/types/product.types';

export default function SampleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: sample, isLoading } = useQuery({
    queryKey: ['sample', slug],
    queryFn: () => samplesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const [selectedTierId, setSelectedTierId] = useState<number | undefined>();
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(20);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);

  const config = sample?.productType?.pricingConfig;
  const tiers: PriceTier[] = sample?.productType?.priceTiers ?? [];

  useEffect(() => {
    if (tiers.length > 0 && !selectedTierId) {
      const def = tiers.find((t) => t.isDefault) || tiers[0];
      setSelectedTierId(def.id);
    }
    if (config?.available_materials?.length && !selectedMaterial) {
      setSelectedMaterial(config.available_materials[0].code);
    }
    if (config?.available_sizes?.length && !selectedSize) {
      setSelectedSize(config.available_sizes[0]);
    }
  }, [sample]);

  const { data: grids = [] } = useQuery({
    queryKey: ['grids', sample?.productTypeId, selectedTierId],
    queryFn: () => priceGridsApi.getGrids(sample!.productTypeId, selectedTierId),
    enabled: !!sample && !!selectedTierId,
  });

  const { data: extraCharges = [] } = useQuery({
    queryKey: ['extra-charges'],
    queryFn: () => priceGridsApi.getExtraCharges(),
  });

  const activeGrid = grids.find((g: PriceGrid) =>
    config?.has_materials ? g.materialCode === selectedMaterial : !g.materialCode || g.materialCode === null,
  );

  const unitPrice = activeGrid
    ? lookupUnitPrice(activeGrid.gridData, selectedSize || null, quantity)
    : 0;

  const extraTotal = extraCharges
    .filter((c: ExtraCharge) => selectedExtraIds.includes(c.id))
    .reduce((sum, c: ExtraCharge) => {
      if (c.chargeType === 'per_item') return sum + c.priceVnd * quantity;
      if (c.chargeType === 'per_100_items') return sum + c.priceVnd * Math.ceil(quantity / 100);
      return sum + c.priceVnd;
    }, 0);

  const subtotal = unitPrice * quantity + extraTotal;

  if (isLoading) return (
    <div className="mx-auto px-4 py-10 container">
      <div className="gap-8 grid md:grid-cols-2">
        <Skeleton className="rounded-2xl aspect-square" />
        <div className="space-y-4"><Skeleton className="w-3/4 h-8" /><Skeleton className="w-full h-4" /><Skeleton className="w-full h-4" /></div>
      </div>
    </div>
  );

  if (!sample) return <div className="mx-auto px-4 py-20 text-center container"><p>Không tìm thấy mẫu</p></div>;

  return (
    <>
      <SEOHead title={sample.name} description={sample.description} />
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

            {/* Price Tier */}
            {tiers.length > 1 && (
              <div>
                <p className="mb-2 font-medium text-sm">Loại giá</p>
                <div className="flex flex-wrap gap-2">
                  {tiers.map((tier) => (
                    <button key={tier.id}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedTierId === tier.id ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setSelectedTierId(tier.id)}>
                      {tier.displayName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material */}
            {config?.has_materials && config.available_materials && (
              <div>
                <p className="mb-2 font-medium text-sm">Chất liệu</p>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger><SelectValue placeholder="Chọn chất liệu" /></SelectTrigger>
                  <SelectContent>
                    {config.available_materials.map((m) => (
                      <SelectItem key={m.code} value={m.code}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Size */}
            {config?.has_dimensions && config.available_sizes && (
              <div>
                <p className="mb-2 font-medium text-sm">Kích thước</p>
                <div className="flex flex-wrap gap-2">
                  {config.available_sizes.map((size) => (
                    <button key={size}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedSize === size ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setSelectedSize(size)}>
                      {size}
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

            {/* Extra charges */}
            {extraCharges.length > 0 && (
              <div>
                <p className="mb-2 font-medium text-sm">Dịch vụ thêm</p>
                <div className="space-y-2">
                  {extraCharges.map((charge: ExtraCharge) => (
                    <label key={charge.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="border-input rounded"
                        checked={selectedExtraIds.includes(charge.id)}
                        onChange={(e) => setSelectedExtraIds(e.target.checked ? [...selectedExtraIds, charge.id] : selectedExtraIds.filter((id) => id !== charge.id))} />
                      <span className="text-sm">{charge.name}</span>
                      <span className="ml-auto text-muted-foreground text-xs">
                        +{formatVND(charge.priceVnd)}/{charge.chargeType === 'per_item' ? 'cái' : 'lần'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price summary */}
            <div className="space-y-2 bg-muted/50 p-4 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đơn giá</span>
                <span>{unitPrice > 0 ? formatVND(unitPrice) : '--'} × {quantity}</span>
              </div>
              {extraTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phụ phí</span>
                  <span>+{formatVND(extraTotal)}</span>
                </div>
              )}
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
        {activeGrid && (
          <div className="mt-12">
            <h2 className="mb-4 font-semibold text-lg">Bảng giá tham khảo</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left">Số lượng</th>
                    {Object.keys(activeGrid.gridData.rows[0]?.values || {}).map((size) => (
                      <th key={size} className="px-4 py-3 font-medium text-right">{size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeGrid.gridData.rows.map((row, i) => (
                    <tr key={i} className={`border-t ${quantity >= parseInt(row.quantity) ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 font-medium">{row.quantity} cái+</td>
                      {Object.values(row.values).map((price, j) => (
                        <td key={j} className="px-4 py-3 text-right">{formatVND(price)}</td>
                      ))}
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
