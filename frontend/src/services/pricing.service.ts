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
  extraCharges: ExtraChargeOption[];
}

export interface ExtraChargeOption {
  id: number;
  name: string;
  chargeType: 'free' | 'per_unit' | 'fixed_total';
  priceVnd: number;
  isPerItem: boolean;
}

type PriceTableLayoutMetadata = {
  layoutVersion?: number;
  rowFactorId?: number;
  columnFactorId?: number | null;
  groupFactorId?: number | null;
  selectedRowValueIds?: number[];
  selectedColumnValueIds?: number[];
  selectedGroupValueIds?: number[];
  informationalFactorValueIds?: number[];
  informationalFactorAdjustments?: Array<{
    factorValueId: number;
    pricingMode: 'free' | 'per_unit' | 'fixed_total';
    amountVnd?: number | null;
    label?: string | null;
  }>;
  priceColumnLabel?: string;
  quantityColumnLabel?: string;
  unitLabel?: string;
  previewTitle?: string | null;
  previewSubtitle?: string | null;
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
  factor_type: 'select' | 'quantity_range' | 'quantity_value' | 'number_range' | 'boolean' | 'text';
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
  pricing_mode: 'fixed_total' | 'per_unit' | 'quote_required' | string;
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
  groupValueId: number | null;
  rowValueId: number;
  columnValueId: number | null;
  priceVnd: number | null;
  pricingMode: string;
};

export type PriceMatrixGroup = {
  id: number | null;
  label: string;
  note?: string | null;
};

export type PriceMatrix = {
  title: string;
  subtitle?: string | null;
  quantityLabel: string;
  priceLabel: string;
  unitLabel: string;
  groups: PriceMatrixGroup[];
  columns: Array<{ id: number | null; label: string }>;
  rows: Array<{
    id: number;
    label: string;
    rangeLabel: string;
    cells: PriceMatrixCell[];
  }>;
  extraCharges: ExtraChargeOption[];
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

function buildExtraCharges(metadata: PriceTableLayoutMetadata, factors: PublicFactorEntry[]): ExtraChargeOption[] {
  const selectedIds = new Set((metadata.informationalFactorValueIds ?? []).map(Number));
  const adjustments = new Map((metadata.informationalFactorAdjustments ?? []).map((item) => [Number(item.factorValueId), item]));

  return factors
    .flatMap((entry) => entry.values)
    .filter((value) => selectedIds.has(Number(value.id)))
    .map((value) => {
      const adjustment = adjustments.get(Number(value.id));
      const chargeType = adjustment?.pricingMode ?? 'free';
      const priceVnd = chargeType === 'free' ? 0 : Number(adjustment?.amountVnd ?? 0);
      return {
        id: Number(value.id),
        name: adjustment?.label?.trim() || String(value.metadata?.displayNote || value.label),
        chargeType,
        priceVnd,
        isPerItem: chargeType === 'per_unit',
      };
    });
}

function pickValues(values: FactorValueRow[], selectedIds?: number[]) {
  if (!selectedIds?.length) return values;
  const valueById = new Map(values.map((value) => [Number(value.id), value]));
  return selectedIds.map((id) => valueById.get(Number(id))).filter(Boolean) as FactorValueRow[];
}

function buildMatrix(payload: ActivePriceTablePayload): PriceMatrix | null {
  const table = payload.priceTable;
  const factors = payload.factors ?? [];
  const rules = payload.rules ?? [];
  if (!table) return null;

  const metadata = table.metadata ?? {};
  const extraCharges = buildExtraCharges(metadata, factors);
  const rowFactor =
    factors.find((entry) => Number(entry.productTypeFactor.id) === Number(metadata.rowFactorId)) ??
    factors.find((entry) => entry.factor.factor_key === 'quantity' || entry.factor.factor_type === 'quantity_range' || entry.factor.factor_type === 'quantity_value');
  if (!rowFactor) return null;

  const hasColumnMetadata = Object.prototype.hasOwnProperty.call(metadata, 'columnFactorId');
  const columnFactor = metadata.columnFactorId
    ? factors.find((entry) => Number(entry.productTypeFactor.id) === Number(metadata.columnFactorId))
    : hasColumnMetadata
      ? null
      : factors.find((entry) => Number(entry.productTypeFactor.id) !== Number(rowFactor.productTypeFactor.id));

  const rowValues = pickValues(rowFactor.values, metadata.selectedRowValueIds);
  const columnValues = columnFactor ? pickValues(columnFactor.values, metadata.selectedColumnValueIds) : [];
  const groupFactor = metadata.groupFactorId
    ? factors.find((entry) => Number(entry.productTypeFactor.id) === Number(metadata.groupFactorId))
    : null;
  const groupValues = groupFactor ? pickValues(groupFactor.values, metadata.selectedGroupValueIds) : [];

  const columns = columnFactor
    ? columnValues.map((value) => ({ id: value.id, label: value.label }))
    : [{ id: null, label: metadata.priceColumnLabel || 'Giá' }];
  const groups = groupFactor
    ? groupValues.map((value) => ({ id: value.id, label: value.label, note: typeof value.metadata?.displayNote === 'string' ? value.metadata.displayNote : null }))
    : [{ id: null, label: table.name, note: null }];

  const rows = rowValues.map((rowValue) => ({
    id: rowValue.id,
    label: rowValue.label,
    rangeLabel: formatRange(rowValue),
    cells: groups.flatMap((group) => columns.map((column) => {
      const matched = rules.find((entry) => {
        const hasRow = entry.conditions.some(
          (condition) =>
            Number(condition.product_type_factor_id) === Number(rowFactor.productTypeFactor.id) &&
            Number(condition.factor_value_id) === Number(rowValue.id),
        );
        const hasColumn = column.id == null || entry.conditions.some(
          (condition) =>
            Number(condition.product_type_factor_id) === Number(columnFactor?.productTypeFactor.id) &&
            Number(condition.factor_value_id) === Number(column.id),
        );
        const hasGroup = !groupFactor || entry.conditions.some(
          (condition) =>
            Number(condition.product_type_factor_id) === Number(groupFactor.productTypeFactor.id) &&
            Number(condition.factor_value_id) === Number(group.id),
        );
        return hasRow && hasColumn && hasGroup;
      });

      return {
        groupValueId: group.id,
        rowValueId: rowValue.id,
        columnValueId: column.id,
        priceVnd: matched?.rule.price_vnd == null ? null : Number(matched.rule.price_vnd),
        pricingMode: matched?.rule.pricing_mode ?? 'per_unit',
      };
    })),
  }));

  return {
    title: metadata.previewTitle || table.name,
    subtitle: metadata.previewSubtitle ?? 'Không giới hạn mẫu',
    quantityLabel: metadata.quantityColumnLabel || rowFactor.factor.label || 'Số lượng',
    priceLabel: metadata.priceColumnLabel || 'Giá',
    unitLabel: metadata.unitLabel || 'c',
    groups,
    columns,
    rows,
    extraCharges,
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

export function extraChargesForSelection(config: BasePriceConfig | undefined, quantity: number, selectedExtraId?: number | null) {
  if (!config || !selectedExtraId) return [];
  return config.extraCharges
    .filter((charge) => charge.id === selectedExtraId && charge.priceVnd > 0)
    .map((charge) => ({
      ...charge,
      total: charge.isPerItem ? charge.priceVnd * quantity : charge.priceVnd,
    }));
}

export const pricingService = {
  async getActivePriceTable(productTypeSlug: string): Promise<ActivePriceTable | null> {
    const supabase = getSupabaseClient();
    const getActivePriceTable = supabase.rpc.bind(supabase) as unknown as (
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
      extraCharges: matrix.extraCharges,
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
      effects: unique(configs.flatMap((item) => item.extraCharges.map((charge) => ({ id: charge.id, name: charge.name })))),
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
