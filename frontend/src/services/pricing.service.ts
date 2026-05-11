import { getSupabaseClient } from '@/lib/supabase';

export interface PricingOption {
  id: number;
  name: string;
}

export interface QuantityTier {
  id: number;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number;
}

export interface BasePriceConfig {
  id: number;
  productTypeId: number | null;
  material: PricingOption;
  size: PricingOption;
  side: PricingOption;
  effect: PricingOption | null;
  unitPrice: number;
  quantityTiers: QuantityTier[];
}

type BasePriceRow = {
  id: number;
  product_type_id: number | null;
  unit_price: string | number;
  materials: PricingOption | PricingOption[] | null;
  sizes: PricingOption | PricingOption[] | null;
  sides: PricingOption | PricingOption[] | null;
  effects: PricingOption | PricingOption[] | null;
  quantity_tiers?: Array<{
    id: number;
    min_quantity: number;
    max_quantity: number | null;
    price_per_unit: string | number;
    is_active?: boolean;
  }>;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function uniqueById(items: PricingOption[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export function unitPriceForQuantity(config: BasePriceConfig | undefined, quantity: number) {
  if (!config) return 0;
  const tier = [...config.quantityTiers]
    .filter((item) => item.minQuantity <= quantity && (item.maxQuantity === null || item.maxQuantity >= quantity))
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return tier?.pricePerUnit ?? config.unitPrice;
}

export const pricingService = {
  async getBasePrices(productTypeId: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('base_prices')
      .select(
        'id,product_type_id,unit_price,is_active,materials(id,name),sizes(id,name),sides(id,name),effects(id,name),quantity_tiers(id,min_quantity,max_quantity,price_per_unit,is_active)',
      )
      .or(`product_type_id.eq.${productTypeId},product_type_id.is.null`)
      .eq('is_active', true)
      .order('product_type_id', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true });

    if (error) throw error;

    return ((data || []) as BasePriceRow[])
      .map((row): BasePriceConfig | null => {
        const material = firstRelation(row.materials);
        const size = firstRelation(row.sizes);
        const side = firstRelation(row.sides);
        if (!material || !size || !side) return null;

        return {
          id: row.id,
          productTypeId: row.product_type_id,
          material,
          size,
          side,
          effect: firstRelation(row.effects),
          unitPrice: Number(row.unit_price),
          quantityTiers: (row.quantity_tiers || [])
            .filter((tier) => tier.is_active !== false)
            .map((tier) => ({
              id: tier.id,
              minQuantity: tier.min_quantity,
              maxQuantity: tier.max_quantity,
              pricePerUnit: Number(tier.price_per_unit),
            }))
            .sort((a, b) => a.minQuantity - b.minQuantity),
        };
      })
      .filter(Boolean) as BasePriceConfig[];
  },

  getOptions(configs: BasePriceConfig[]) {
    return {
      materials: uniqueById(configs.map((item) => item.material)),
      sizes: uniqueById(configs.map((item) => item.size)),
      sides: uniqueById(configs.map((item) => item.side)),
      effects: uniqueById(configs.map((item) => item.effect).filter(Boolean) as PricingOption[]),
    };
  },

  findConfig(
    configs: BasePriceConfig[],
    productTypeId: number,
    materialId?: number,
    sizeId?: number,
    sideId?: number,
    effectId?: number | null,
  ) {
    const matches = configs.filter(
      (item) =>
        item.material.id === materialId &&
        item.size.id === sizeId &&
        item.side.id === sideId &&
        (effectId ? item.effect?.id === effectId : item.effect === null),
    );

    return (
      matches.find((item) => item.productTypeId === productTypeId) ||
      matches.find((item) => item.productTypeId === null)
    );
  },
};
