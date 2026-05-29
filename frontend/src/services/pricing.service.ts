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

type PriceTableLayoutMetadata = {
  rowFactorId?: number;
  columnFactorId?: number | null;
  priceColumnLabel?: string;
  quantityColumnLabel?: string;
  unitLabel?: string;
  previewTitle?: string | null;
};

type FactorValueRow = {
  id: number;
  product_type_factor_id: number;
  value_key: string;
  label: string;
  min_number: number | string | null;
  max_number: number | string | null;
  sort_order: number;
  metadata?: Record<string, unknown>;
};

type ProductTypeFactorRow = {
  id: number;
  factor_id: number;
  product_type_id: number;
  sort_order: number;
};

type PricingFactorRow = {
  id: number;
  factor_key: string;
  label: string;
  factor_type: 'select' | 'quantity_range' | 'number_range' | 'boolean' | 'text';
  unit: string | null;
};

type PublicFactorEntry = {
  productTypeFactor: ProductTypeFactorRow;
  factor: PricingFactorRow;
  values: FactorValueRow[];
};

type PriceRuleConditionRow = {
  product_type_factor_id: number;
  factor_value_id: number | null;
};

type PriceRuleRow = {
  id: number;
  price_vnd: number | string | null;
  pricing_mode: string;
};

type PublicRuleEntry = {
  rule: PriceRuleRow;
  conditions: PriceRuleConditionRow[];
};

type ActivePriceTablePayload = {
  productType?: { id: number; name: string; slug: string } | null;
  priceTable?: {
    id: number;
    product_type_id: number;
    name: string;
    status: string;
    currency: string;
    version: number;
    notes: string | null;
    metadata: PriceTableLayoutMetadata | null;
  } | null;
  factors?: PublicFactorEntry[];
  rules?: PublicRuleEntry[];
};

export type PriceMatrixCell = {
  rowValueId: number;
  columnValueId: number | null;
  priceVnd: number | null;
};

export type PriceMatrix = {
  title: string;
  quantityLabel: string;
  priceLabel: string;
  unitLabel: string;
  columns: Array<{ id: number | null; label: string }>;
  rows: Array<{
    id: number;
    label: string;
    rangeLabel: string;
    cells: PriceMatrixCell[];
  }>;
  notes?: string | null;
};

export type ActivePriceTable = {
  productType: ActivePriceTablePayload['productType'];
  priceTable: NonNullable<ActivePriceTablePayload['priceTable']>;
  factors: PublicFactorEntry[];
  rules: PublicRuleEntry[];
  matrix: PriceMatrix | null;
};

function formatRange(value: FactorValueRow) {
  const min = value.min_number == null ? null : Number(value.min_number);
  const max = value.max_number == null ? null : Number(value.max_number);
  if (min != null && max != null && min === max) return `${min}`;
  if (min != null && max != null) return `${min}-${max}`;
  if (min != null) return `Từ ${min}`;
  if (max != null) return `Đến ${max}`;
  return value.label;
}

function buildMatrix(payload: ActivePriceTablePayload): PriceMatrix | null {
  const table = payload.priceTable;
  const factors = payload.factors ?? [];
  const rules = payload.rules ?? [];
  if (!table) return null;

  const metadata = table.metadata ?? {};
  const rowFactor =
    factors.find((entry) => entry.productTypeFactor.id === metadata.rowFactorId) ??
    factors.find((entry) => entry.factor.factor_key === 'quantity' || entry.factor.factor_type === 'quantity_range');
  if (!rowFactor) return null;

  const columnFactor = metadata.columnFactorId
    ? factors.find((entry) => entry.productTypeFactor.id === metadata.columnFactorId)
    : factors.find((entry) => entry.productTypeFactor.id !== rowFactor.productTypeFactor.id);

  const columns = columnFactor
    ? columnFactor.values.map((value) => ({ id: value.id, label: value.label }))
    : [{ id: null, label: metadata.priceColumnLabel || 'Giá' }];

  const rows = rowFactor.values.map((rowValue) => ({
    id: rowValue.id,
    label: rowValue.label,
    rangeLabel: formatRange(rowValue),
    cells: columns.map((column) => {
      const matched = rules.find((entry) => {
        const hasRow = entry.conditions.some(
          (condition) =>
            condition.product_type_factor_id === rowFactor.productTypeFactor.id &&
            condition.factor_value_id === rowValue.id,
        );
        const hasColumn = column.id == null || entry.conditions.some(
          (condition) =>
            condition.product_type_factor_id === columnFactor?.productTypeFactor.id &&
            condition.factor_value_id === column.id,
        );
        return hasRow && hasColumn;
      });

      return {
        rowValueId: rowValue.id,
        columnValueId: column.id,
        priceVnd: matched?.rule.price_vnd == null ? null : Number(matched.rule.price_vnd),
      };
    }),
  }));

  return {
    title: metadata.previewTitle || table.name,
    quantityLabel: metadata.quantityColumnLabel || rowFactor.factor.label || 'Số lượng',
    priceLabel: metadata.priceColumnLabel || 'Giá',
    unitLabel: metadata.unitLabel || 'c',
    columns,
    rows,
    notes: table.notes,
  };
}

export function formatCompactVnd(value: number | null) {
  if (value == null) return '-';
  if (value >= 1000) {
    const rounded = value / 1000;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}k`;
  }
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function unitPriceForQuantity(config: BasePriceConfig | undefined, quantity: number) {
  if (!config) return 0;
  const tier = [...config.quantityTiers]
    .filter((item) => item.minQuantity <= quantity && (item.maxQuantity === null || item.maxQuantity >= quantity))
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return tier?.pricePerUnit ?? config.unitPrice;
}

export const pricingService = {
  async getActivePriceTable(productTypeSlug: string): Promise<ActivePriceTable | null> {
    const supabase = getSupabaseClient();
    const getActivePriceTable = supabase.rpc as unknown as (
      fn: 'get_active_price_table',
      args: { product_type_slug: string },
    ) => Promise<{ data: unknown; error: Error | null }>;
    const { data, error } = await getActivePriceTable('get_active_price_table', { product_type_slug: productTypeSlug });
    if (error) throw error;
    if (!data) return null;

    const payload = data as ActivePriceTablePayload;
    if (!payload.priceTable) return null;

    return {
      productType: payload.productType ?? null,
      priceTable: payload.priceTable,
      factors: payload.factors ?? [],
      rules: payload.rules ?? [],
      matrix: buildMatrix(payload),
    };
  },

  async getBasePrices(productTypeId: number): Promise<BasePriceConfig[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('public_active_product_types')
      .select('id,slug')
      .eq('id', productTypeId)
      .single();
    if (error) throw error;

    const productType = data as { slug: string | null };
    if (!productType.slug) return [];

    const activeTable = await this.getActivePriceTable(productType.slug);
    const matrix = activeTable?.matrix;
    if (!matrix) return [];

    return matrix.columns.map((column, index) => ({
      id: column.id ?? index + 1,
      productTypeId,
      material: { id: column.id ?? index + 1, name: column.label },
      size: { id: column.id ?? index + 1, name: column.label },
      side: { id: 1, name: 'Mặc định' },
      effect: null,
      unitPrice: matrix.rows[0]?.cells[index]?.priceVnd ?? 0,
      quantityTiers: matrix.rows.map((row) => ({
        id: row.id,
        minQuantity: Number(row.rangeLabel.match(/\d+/)?.[0] ?? 1),
        maxQuantity: null,
        pricePerUnit: row.cells[index]?.priceVnd ?? 0,
      })),
    }));
  },

  getOptions(configs: BasePriceConfig[]) {
    const unique = (items: PricingOption[]) => Array.from(new Map(items.map((item) => [item.id, item])).values());
    return {
      materials: unique(configs.map((item) => item.material)),
      sizes: unique(configs.map((item) => item.size)),
      sides: unique(configs.map((item) => item.side)),
      effects: unique(configs.map((item) => item.effect).filter(Boolean) as PricingOption[]),
    };
  },

  findConfig(
    configs: BasePriceConfig[],
    _productTypeId: number,
    materialId?: number,
    _sizeId?: number,
    _sideId?: number,
    _effectId?: number | null,
  ) {
    return configs.find((item) => item.material.id === materialId) ?? configs[0];
  },
};
