-- Seed common pricing factors used by the Admin price table workflow.
-- Idempotent: can be re-run safely after the base schema migration.

INSERT INTO pricing_factors (factor_key, label, factor_type, unit, status, sort_order, metadata)
VALUES
  (
    'quantity',
    'Số lượng',
    'quantity_range',
    'cái',
    'active',
    10,
    '{"seed": true, "common": true, "systemRole": "price_table_row_axis", "description": "Bắt buộc cho mọi bảng giá; dùng làm cột đầu tiên/trục số lượng."}'::jsonb
  ),
  (
    'size',
    'Kích thước',
    'select',
    NULL,
    'active',
    20,
    '{"seed": true, "common": true, "systemRole": "price_table_column_axis", "description": "Column factor phổ biến cho bảng giá theo kích thước."}'::jsonb
  ),
  (
    'lamination_effect',
    'Hiệu ứng cán',
    'select',
    NULL,
    'active',
    30,
    '{"seed": true, "common": true, "systemRole": "informational_or_column_factor", "description": "Dùng cho cán bóng, cán mờ, holo, bling hoặc hiệu ứng cán đặc biệt."}'::jsonb
  ),
  (
    'hole_punching',
    'Bấm lỗ',
    'boolean',
    NULL,
    'active',
    40,
    '{"seed": true, "common": true, "systemRole": "informational_factor", "description": "Dùng cho tùy chọn bấm lỗ; thường hiển thị như phụ phí thông tin, không tự cộng vào matrix."}'::jsonb
  )
ON CONFLICT (factor_key) DO UPDATE
SET
  label = EXCLUDED.label,
  factor_type = EXCLUDED.factor_type,
  unit = EXCLUDED.unit,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  metadata = pricing_factors.metadata || EXCLUDED.metadata;
