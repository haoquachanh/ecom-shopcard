import type { GridData } from '@/types/product.types';

/**
 * Tra giá từ gridData (client-side preview).
 * Tìm row lớn nhất mà quantity >= threshold, fallback về row đầu tiên.
 */
export function lookupUnitPrice(
  gridData: GridData,
  size: string | null,
  quantity: number,
): number {
  if (!gridData?.rows?.length) return 0;
  const rows = [...gridData.rows].sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity));
  let selected = rows[0];
  for (const row of rows) {
    if (quantity >= parseInt(row.quantity)) selected = row;
  }
  if (!size) {
    const firstKey = Object.keys(selected.values)[0];
    return selected.values[firstKey] ?? 0;
  }
  return selected.values[size] ?? 0;
}
