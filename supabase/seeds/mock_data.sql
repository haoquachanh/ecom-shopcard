-- ======================================================
-- ECOM SHOPCARD MOCK DATA
-- Run after supabase/migrations/001_prompt_architecture_schema.sql.
--
-- Notes:
-- - Intended for development/staging databases.
-- - Idempotent for catalog/pricing/content/settings/media rows.
-- - Does not create Supabase Auth users or admin_users.
-- ======================================================

BEGIN;

DO $$
DECLARE
  business_cards_id BIGINT;
  stickers_id BIGINT;
  packaging_id BIGINT;

  factor_quantity_id BIGINT;
  factor_size_id BIGINT;
  factor_material_id BIGINT;
  factor_finish_id BIGINT;
  factor_print_sides_id BIGINT;
  factor_rush_id BIGINT;

  bc_quantity_ptf_id BIGINT;
  bc_size_ptf_id BIGINT;
  bc_material_ptf_id BIGINT;
  bc_finish_ptf_id BIGINT;
  bc_print_sides_ptf_id BIGINT;
  bc_rush_ptf_id BIGINT;

  st_quantity_ptf_id BIGINT;
  st_size_ptf_id BIGINT;
  st_material_ptf_id BIGINT;
  st_finish_ptf_id BIGINT;
  st_rush_ptf_id BIGINT;

  bc_table_id BIGINT;
  st_table_id BIGINT;
  bc_rule_basic_id BIGINT;
  bc_rule_premium_id BIGINT;
  st_rule_basic_id BIGINT;
  st_rule_large_id BIGINT;
  bc_table_status price_table_status;
  st_table_status price_table_status;
  bc_table_version INT;
  st_table_version INT;

  sample_bc_id BIGINT;
  sample_sticker_id BIGINT;
  hero_section_id BIGINT;
  samples_section_id BIGINT;
BEGIN
  -- ---------- Product types ----------
  INSERT INTO product_types (name, slug, description, image_url, status, sort_order, metadata)
  VALUES
    (
      'Card visit',
      'business-cards',
      'In card visit, name card và thẻ thương hiệu với nhiều chất liệu giấy.',
      '/storage/v1/object/public/content-media/mock/product-types/business-cards.jpg',
      'active',
      10,
      '{"seed": true, "category": "print"}'::jsonb
    )
  ON CONFLICT (slug) WHERE slug IS NOT NULL DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      image_url = EXCLUDED.image_url,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_types.metadata || EXCLUDED.metadata
  RETURNING id INTO business_cards_id;

  INSERT INTO product_types (name, slug, description, image_url, status, sort_order, metadata)
  VALUES
    (
      'Sticker',
      'stickers',
      'In decal giấy, decal nhựa và sticker theo bộ nhận diện.',
      '/storage/v1/object/public/content-media/mock/product-types/stickers.jpg',
      'active',
      20,
      '{"seed": true, "category": "print"}'::jsonb
    )
  ON CONFLICT (slug) WHERE slug IS NOT NULL DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      image_url = EXCLUDED.image_url,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_types.metadata || EXCLUDED.metadata
  RETURNING id INTO stickers_id;

  INSERT INTO product_types (name, slug, description, image_url, status, sort_order, metadata)
  VALUES
    (
      'Bao bì hộp giấy',
      'paper-packaging',
      'Nhóm sản phẩm demo chưa bật công khai.',
      '/storage/v1/object/public/content-media/mock/product-types/paper-packaging.jpg',
      'draft',
      30,
      '{"seed": true, "category": "packaging"}'::jsonb
    )
  ON CONFLICT (slug) WHERE slug IS NOT NULL DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      image_url = EXCLUDED.image_url,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_types.metadata || EXCLUDED.metadata
  RETURNING id INTO packaging_id;

  -- ---------- Global pricing factors ----------
  INSERT INTO pricing_factors (factor_key, label, factor_type, unit, status, sort_order, metadata)
  VALUES ('quantity', 'Số lượng', 'quantity_range', 'cái', 'active', 10, '{"seed": true}'::jsonb)
  ON CONFLICT (factor_key) DO UPDATE
  SET label = EXCLUDED.label,
      factor_type = EXCLUDED.factor_type,
      unit = EXCLUDED.unit,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = pricing_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO factor_quantity_id;

  INSERT INTO pricing_factors (factor_key, label, factor_type, unit, status, sort_order, metadata)
  VALUES ('size', 'Kích thước', 'select', NULL, 'active', 20, '{"seed": true}'::jsonb)
  ON CONFLICT (factor_key) DO UPDATE
  SET label = EXCLUDED.label,
      factor_type = EXCLUDED.factor_type,
      unit = EXCLUDED.unit,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = pricing_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO factor_size_id;

  INSERT INTO pricing_factors (factor_key, label, factor_type, unit, status, sort_order, metadata)
  VALUES ('material', 'Chất liệu', 'select', NULL, 'active', 30, '{"seed": true}'::jsonb)
  ON CONFLICT (factor_key) DO UPDATE
  SET label = EXCLUDED.label,
      factor_type = EXCLUDED.factor_type,
      unit = EXCLUDED.unit,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = pricing_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO factor_material_id;

  INSERT INTO pricing_factors (factor_key, label, factor_type, unit, status, sort_order, metadata)
  VALUES ('finish', 'Gia công', 'select', NULL, 'active', 40, '{"seed": true}'::jsonb)
  ON CONFLICT (factor_key) DO UPDATE
  SET label = EXCLUDED.label,
      factor_type = EXCLUDED.factor_type,
      unit = EXCLUDED.unit,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = pricing_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO factor_finish_id;

  INSERT INTO pricing_factors (factor_key, label, factor_type, unit, status, sort_order, metadata)
  VALUES ('print_sides', 'Mặt in', 'select', NULL, 'active', 50, '{"seed": true}'::jsonb)
  ON CONFLICT (factor_key) DO UPDATE
  SET label = EXCLUDED.label,
      factor_type = EXCLUDED.factor_type,
      unit = EXCLUDED.unit,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = pricing_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO factor_print_sides_id;

  INSERT INTO pricing_factors (factor_key, label, factor_type, unit, status, sort_order, metadata)
  VALUES ('rush', 'Lấy nhanh', 'boolean', NULL, 'active', 60, '{"seed": true}'::jsonb)
  ON CONFLICT (factor_key) DO UPDATE
  SET label = EXCLUDED.label,
      factor_type = EXCLUDED.factor_type,
      unit = EXCLUDED.unit,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = pricing_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO factor_rush_id;

  -- ---------- Factor assignments ----------
  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (business_cards_id, factor_quantity_id, TRUE, 'active', 10, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_quantity_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (business_cards_id, factor_size_id, TRUE, 'active', 20, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_size_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (business_cards_id, factor_material_id, TRUE, 'active', 30, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_material_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (business_cards_id, factor_finish_id, TRUE, 'active', 40, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_finish_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (business_cards_id, factor_print_sides_id, TRUE, 'active', 50, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_print_sides_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (business_cards_id, factor_rush_id, FALSE, 'active', 60, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_rush_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (stickers_id, factor_quantity_id, TRUE, 'active', 10, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO st_quantity_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (stickers_id, factor_size_id, TRUE, 'active', 20, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO st_size_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (stickers_id, factor_material_id, TRUE, 'active', 30, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO st_material_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (stickers_id, factor_finish_id, FALSE, 'active', 40, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO st_finish_ptf_id;

  INSERT INTO product_type_factors (product_type_id, factor_id, is_required, status, sort_order, metadata)
  VALUES (stickers_id, factor_rush_id, FALSE, 'active', 50, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_id, factor_id) DO UPDATE
  SET is_required = EXCLUDED.is_required,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factors.metadata || EXCLUDED.metadata
  RETURNING id INTO st_rush_ptf_id;

  -- ---------- Factor values: business cards ----------
  INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, min_number, max_number, status, sort_order, metadata)
  VALUES
    (bc_quantity_ptf_id, 'qty_100_499', '100 - 499 cái', 100, 499, 'active', 10, '{"seed": true}'::jsonb),
    (bc_quantity_ptf_id, 'qty_500_999', '500 - 999 cái', 500, 999, 'active', 20, '{"seed": true}'::jsonb),
    (bc_quantity_ptf_id, 'qty_1000_plus', 'Từ 1000 cái', 1000, NULL, 'active', 30, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_factor_id, value_key) DO UPDATE
  SET label = EXCLUDED.label,
      min_number = EXCLUDED.min_number,
      max_number = EXCLUDED.max_number,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factor_values.metadata || EXCLUDED.metadata;

  INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, status, sort_order, metadata)
  VALUES
    (bc_size_ptf_id, '90x54', '90 x 54 mm', 'active', 10, '{"seed": true}'::jsonb),
    (bc_size_ptf_id, '90x50', '90 x 50 mm', 'active', 20, '{"seed": true}'::jsonb),
    (bc_material_ptf_id, 'couche_300', 'Couche 300gsm', 'active', 10, '{"seed": true}'::jsonb),
    (bc_material_ptf_id, 'bristol_350', 'Bristol 350gsm', 'active', 20, '{"seed": true}'::jsonb),
    (bc_finish_ptf_id, 'matte', 'Cán mờ', 'active', 10, '{"seed": true}'::jsonb),
    (bc_finish_ptf_id, 'glossy', 'Cán bóng', 'active', 20, '{"seed": true}'::jsonb),
    (bc_finish_ptf_id, 'premium_lamination', 'Ép kim/cán đặc biệt', 'active', 30, '{"seed": true}'::jsonb),
    (bc_print_sides_ptf_id, 'single', 'In 1 mặt', 'active', 10, '{"seed": true}'::jsonb),
    (bc_print_sides_ptf_id, 'double', 'In 2 mặt', 'active', 20, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_factor_id, value_key) DO UPDATE
  SET label = EXCLUDED.label,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factor_values.metadata || EXCLUDED.metadata;

  INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, boolean_value, status, sort_order, metadata)
  VALUES
    (bc_rush_ptf_id, 'no', 'Tiêu chuẩn', FALSE, 'active', 10, '{"seed": true}'::jsonb),
    (bc_rush_ptf_id, 'yes', 'Lấy nhanh', TRUE, 'active', 20, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_factor_id, value_key) DO UPDATE
  SET label = EXCLUDED.label,
      boolean_value = EXCLUDED.boolean_value,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factor_values.metadata || EXCLUDED.metadata;

  -- ---------- Factor values: stickers ----------
  INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, min_number, max_number, status, sort_order, metadata)
  VALUES
    (st_quantity_ptf_id, 'qty_100_499', '100 - 499 cái', 100, 499, 'active', 10, '{"seed": true}'::jsonb),
    (st_quantity_ptf_id, 'qty_500_999', '500 - 999 cái', 500, 999, 'active', 20, '{"seed": true}'::jsonb),
    (st_quantity_ptf_id, 'qty_1000_plus', 'Từ 1000 cái', 1000, NULL, 'active', 30, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_factor_id, value_key) DO UPDATE
  SET label = EXCLUDED.label,
      min_number = EXCLUDED.min_number,
      max_number = EXCLUDED.max_number,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factor_values.metadata || EXCLUDED.metadata;

  INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, status, sort_order, metadata)
  VALUES
    (st_size_ptf_id, 'a6', 'A6', 'active', 10, '{"seed": true}'::jsonb),
    (st_size_ptf_id, 'a5', 'A5', 'active', 20, '{"seed": true}'::jsonb),
    (st_material_ptf_id, 'decal_paper', 'Decal giấy', 'active', 10, '{"seed": true}'::jsonb),
    (st_material_ptf_id, 'decal_pp', 'Decal nhựa PP', 'active', 20, '{"seed": true}'::jsonb),
    (st_finish_ptf_id, 'none', 'Không cán', 'active', 10, '{"seed": true}'::jsonb),
    (st_finish_ptf_id, 'glossy', 'Cán bóng', 'active', 20, '{"seed": true}'::jsonb),
    (st_finish_ptf_id, 'matte', 'Cán mờ', 'active', 30, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_factor_id, value_key) DO UPDATE
  SET label = EXCLUDED.label,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factor_values.metadata || EXCLUDED.metadata;

  INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, boolean_value, status, sort_order, metadata)
  VALUES
    (st_rush_ptf_id, 'no', 'Tiêu chuẩn', FALSE, 'active', 10, '{"seed": true}'::jsonb),
    (st_rush_ptf_id, 'yes', 'Lấy nhanh', TRUE, 'active', 20, '{"seed": true}'::jsonb)
  ON CONFLICT (product_type_factor_id, value_key) DO UPDATE
  SET label = EXCLUDED.label,
      boolean_value = EXCLUDED.boolean_value,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = product_type_factor_values.metadata || EXCLUDED.metadata;

  -- ---------- Price tables ----------
  bc_table_status := CASE
    WHEN EXISTS (
      SELECT 1
      FROM price_tables
      WHERE product_type_id = business_cards_id
        AND status = 'active'
        AND slug <> 'business-cards-demo-v1'
    )
    THEN 'draft'::price_table_status
    ELSE 'active'::price_table_status
  END;

  st_table_status := CASE
    WHEN EXISTS (
      SELECT 1
      FROM price_tables
      WHERE product_type_id = stickers_id
        AND status = 'active'
        AND slug <> 'stickers-demo-v1'
    )
    THEN 'draft'::price_table_status
    ELSE 'active'::price_table_status
  END;

  SELECT COALESCE(
    (SELECT version FROM price_tables WHERE product_type_id = business_cards_id AND slug = 'business-cards-demo-v1' LIMIT 1),
    GREATEST(9001, COALESCE((SELECT MAX(version) FROM price_tables WHERE product_type_id = business_cards_id), 0) + 1)
  )
  INTO bc_table_version;

  SELECT COALESCE(
    (SELECT version FROM price_tables WHERE product_type_id = stickers_id AND slug = 'stickers-demo-v1' LIMIT 1),
    GREATEST(9001, COALESCE((SELECT MAX(version) FROM price_tables WHERE product_type_id = stickers_id), 0) + 1)
  )
  INTO st_table_version;

  INSERT INTO price_tables (product_type_id, name, slug, status, version, currency, effective_from, notes, metadata)
  VALUES (
    business_cards_id,
    'Bảng giá card visit demo v1',
    'business-cards-demo-v1',
    bc_table_status,
    bc_table_version,
    'VND',
    NOW(),
    'Seed data for development.',
    '{"seed": true}'::jsonb
  )
  ON CONFLICT (product_type_id, slug) WHERE slug IS NOT NULL DO UPDATE
  SET name = EXCLUDED.name,
      status = EXCLUDED.status,
      version = EXCLUDED.version,
      currency = EXCLUDED.currency,
      effective_from = EXCLUDED.effective_from,
      notes = EXCLUDED.notes,
      metadata = price_tables.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_table_id;

  INSERT INTO price_tables (product_type_id, name, slug, status, version, currency, effective_from, notes, metadata)
  VALUES (
    stickers_id,
    'Bảng giá sticker demo v1',
    'stickers-demo-v1',
    st_table_status,
    st_table_version,
    'VND',
    NOW(),
    'Seed data for development.',
    '{"seed": true}'::jsonb
  )
  ON CONFLICT (product_type_id, slug) WHERE slug IS NOT NULL DO UPDATE
  SET name = EXCLUDED.name,
      status = EXCLUDED.status,
      version = EXCLUDED.version,
      currency = EXCLUDED.currency,
      effective_from = EXCLUDED.effective_from,
      notes = EXCLUDED.notes,
      metadata = price_tables.metadata || EXCLUDED.metadata
  RETURNING id INTO st_table_id;

  -- ---------- Price rules ----------
  INSERT INTO price_rules (price_table_id, condition_hash, pricing_mode, price_vnd, min_order_amount_vnd, status, sort_order, metadata)
  VALUES (
    bc_table_id,
    'finish:matte|material:couche_300|print_sides:double|quantity:qty_100_499|rush:no|size:90x54',
    'per_unit',
    1200,
    120000,
    'active',
    10,
    '{"seed": true, "name": "Card visit basic"}'::jsonb
  )
  ON CONFLICT (price_table_id, condition_hash) DO UPDATE
  SET pricing_mode = EXCLUDED.pricing_mode,
      price_vnd = EXCLUDED.price_vnd,
      min_order_amount_vnd = EXCLUDED.min_order_amount_vnd,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = price_rules.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_rule_basic_id;

  INSERT INTO price_rules (price_table_id, condition_hash, pricing_mode, price_vnd, min_order_amount_vnd, status, sort_order, metadata)
  VALUES (
    bc_table_id,
    'finish:premium_lamination|material:bristol_350|print_sides:double|quantity:qty_1000_plus|rush:yes|size:90x54',
    'quote_required',
    NULL,
    0,
    'active',
    20,
    '{"seed": true, "name": "Card visit premium quote"}'::jsonb
  )
  ON CONFLICT (price_table_id, condition_hash) DO UPDATE
  SET pricing_mode = EXCLUDED.pricing_mode,
      price_vnd = EXCLUDED.price_vnd,
      min_order_amount_vnd = EXCLUDED.min_order_amount_vnd,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = price_rules.metadata || EXCLUDED.metadata
  RETURNING id INTO bc_rule_premium_id;

  INSERT INTO price_rules (price_table_id, condition_hash, pricing_mode, price_vnd, min_order_amount_vnd, status, sort_order, metadata)
  VALUES (
    st_table_id,
    'finish:glossy|material:decal_paper|quantity:qty_100_499|rush:no|size:a6',
    'per_unit',
    900,
    90000,
    'active',
    10,
    '{"seed": true, "name": "Sticker basic"}'::jsonb
  )
  ON CONFLICT (price_table_id, condition_hash) DO UPDATE
  SET pricing_mode = EXCLUDED.pricing_mode,
      price_vnd = EXCLUDED.price_vnd,
      min_order_amount_vnd = EXCLUDED.min_order_amount_vnd,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = price_rules.metadata || EXCLUDED.metadata
  RETURNING id INTO st_rule_basic_id;

  INSERT INTO price_rules (price_table_id, condition_hash, pricing_mode, price_vnd, min_order_amount_vnd, status, sort_order, metadata)
  VALUES (
    st_table_id,
    'finish:matte|material:decal_pp|quantity:qty_1000_plus|rush:yes|size:a5',
    'per_unit',
    1800,
    1800000,
    'active',
    20,
    '{"seed": true, "name": "Sticker PP large rush"}'::jsonb
  )
  ON CONFLICT (price_table_id, condition_hash) DO UPDATE
  SET pricing_mode = EXCLUDED.pricing_mode,
      price_vnd = EXCLUDED.price_vnd,
      min_order_amount_vnd = EXCLUDED.min_order_amount_vnd,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = price_rules.metadata || EXCLUDED.metadata
  RETURNING id INTO st_rule_large_id;

  -- ---------- Price rule conditions ----------
  INSERT INTO price_rule_conditions (price_rule_id, product_type_factor_id, factor_value_id, operator, value_key)
  VALUES
    (bc_rule_basic_id, bc_finish_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_finish_ptf_id AND value_key = 'matte'), 'eq', 'matte'),
    (bc_rule_basic_id, bc_material_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_material_ptf_id AND value_key = 'couche_300'), 'eq', 'couche_300'),
    (bc_rule_basic_id, bc_print_sides_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_print_sides_ptf_id AND value_key = 'double'), 'eq', 'double'),
    (bc_rule_basic_id, bc_quantity_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_quantity_ptf_id AND value_key = 'qty_100_499'), 'eq', 'qty_100_499'),
    (bc_rule_basic_id, bc_rush_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_rush_ptf_id AND value_key = 'no'), 'eq', 'no'),
    (bc_rule_basic_id, bc_size_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_size_ptf_id AND value_key = '90x54'), 'eq', '90x54'),
    (bc_rule_premium_id, bc_finish_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_finish_ptf_id AND value_key = 'premium_lamination'), 'eq', 'premium_lamination'),
    (bc_rule_premium_id, bc_material_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_material_ptf_id AND value_key = 'bristol_350'), 'eq', 'bristol_350'),
    (bc_rule_premium_id, bc_print_sides_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_print_sides_ptf_id AND value_key = 'double'), 'eq', 'double'),
    (bc_rule_premium_id, bc_quantity_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_quantity_ptf_id AND value_key = 'qty_1000_plus'), 'eq', 'qty_1000_plus'),
    (bc_rule_premium_id, bc_rush_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_rush_ptf_id AND value_key = 'yes'), 'eq', 'yes'),
    (bc_rule_premium_id, bc_size_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = bc_size_ptf_id AND value_key = '90x54'), 'eq', '90x54'),
    (st_rule_basic_id, st_finish_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_finish_ptf_id AND value_key = 'glossy'), 'eq', 'glossy'),
    (st_rule_basic_id, st_material_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_material_ptf_id AND value_key = 'decal_paper'), 'eq', 'decal_paper'),
    (st_rule_basic_id, st_quantity_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_quantity_ptf_id AND value_key = 'qty_100_499'), 'eq', 'qty_100_499'),
    (st_rule_basic_id, st_rush_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_rush_ptf_id AND value_key = 'no'), 'eq', 'no'),
    (st_rule_basic_id, st_size_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_size_ptf_id AND value_key = 'a6'), 'eq', 'a6'),
    (st_rule_large_id, st_finish_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_finish_ptf_id AND value_key = 'matte'), 'eq', 'matte'),
    (st_rule_large_id, st_material_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_material_ptf_id AND value_key = 'decal_pp'), 'eq', 'decal_pp'),
    (st_rule_large_id, st_quantity_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_quantity_ptf_id AND value_key = 'qty_1000_plus'), 'eq', 'qty_1000_plus'),
    (st_rule_large_id, st_rush_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_rush_ptf_id AND value_key = 'yes'), 'eq', 'yes'),
    (st_rule_large_id, st_size_ptf_id, (SELECT id FROM product_type_factor_values WHERE product_type_factor_id = st_size_ptf_id AND value_key = 'a5'), 'eq', 'a5')
  ON CONFLICT (price_rule_id, product_type_factor_id) DO UPDATE
  SET factor_value_id = EXCLUDED.factor_value_id,
      operator = EXCLUDED.operator,
      value_key = EXCLUDED.value_key,
      min_number = EXCLUDED.min_number,
      max_number = EXCLUDED.max_number,
      text_value = EXCLUDED.text_value,
      boolean_value = EXCLUDED.boolean_value;

  -- ---------- Sample products ----------
  INSERT INTO sample_products (product_type_id, name, slug, description, status, sort_order, tags, metadata)
  VALUES (
    business_cards_id,
    'Card visit spa cao cấp',
    'mock-card-visit-spa',
    'Mẫu card visit tông sáng, cán mờ, in hai mặt cho spa và studio.',
    'active',
    10,
    ARRAY['card-visit', 'spa', 'premium'],
    '{"seed": true}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE
  SET product_type_id = EXCLUDED.product_type_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      tags = EXCLUDED.tags,
      metadata = sample_products.metadata || EXCLUDED.metadata
  RETURNING id INTO sample_bc_id;

  INSERT INTO sample_products (product_type_id, name, slug, description, status, sort_order, tags, metadata)
  VALUES (
    stickers_id,
    'Sticker nhãn cà phê',
    'mock-sticker-coffee-label',
    'Mẫu sticker decal giấy cho hũ cà phê và bao bì thủ công.',
    'active',
    20,
    ARRAY['sticker', 'coffee', 'label'],
    '{"seed": true}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE
  SET product_type_id = EXCLUDED.product_type_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      tags = EXCLUDED.tags,
      metadata = sample_products.metadata || EXCLUDED.metadata
  RETURNING id INTO sample_sticker_id;

  INSERT INTO sample_product_media (sample_product_id, media_type, bucket, storage_path, public_url, alt_text, is_primary, status, sort_order, metadata)
  VALUES
    (
      sample_bc_id,
      'image',
      'product-samples',
      'mock/samples/card-visit-spa-01.jpg',
      '/storage/v1/object/public/product-samples/mock/samples/card-visit-spa-01.jpg',
      'Mẫu card visit spa cao cấp',
      TRUE,
      'active',
      10,
      '{"seed": true}'::jsonb
    ),
    (
      sample_sticker_id,
      'image',
      'product-samples',
      'mock/samples/sticker-coffee-label-01.jpg',
      '/storage/v1/object/public/product-samples/mock/samples/sticker-coffee-label-01.jpg',
      'Mẫu sticker nhãn cà phê',
      TRUE,
      'active',
      10,
      '{"seed": true}'::jsonb
    )
  ON CONFLICT (bucket, storage_path) DO UPDATE
  SET sample_product_id = EXCLUDED.sample_product_id,
      media_type = EXCLUDED.media_type,
      public_url = EXCLUDED.public_url,
      alt_text = EXCLUDED.alt_text,
      is_primary = EXCLUDED.is_primary,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = sample_product_media.metadata || EXCLUDED.metadata;

  -- ---------- Content ----------
  INSERT INTO content_sections (section_key, title, subtitle, body, cta_label, cta_url, placement, status, sort_order, metadata)
  VALUES (
    'home_hero_mock',
    'In ấn theo cấu hình sản phẩm',
    'Chọn loại sản phẩm, chất liệu, số lượng và nhận bảng giá đang active.',
    'Dữ liệu demo này dùng để kiểm tra public frontend, RPC homepage và chi tiết loại sản phẩm.',
    'Xem mẫu in',
    '/samples',
    'home',
    'active',
    10,
    '{"seed": true}'::jsonb
  )
  ON CONFLICT (section_key) DO UPDATE
  SET title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      body = EXCLUDED.body,
      cta_label = EXCLUDED.cta_label,
      cta_url = EXCLUDED.cta_url,
      placement = EXCLUDED.placement,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = content_sections.metadata || EXCLUDED.metadata
  RETURNING id INTO hero_section_id;

  INSERT INTO content_sections (section_key, title, subtitle, body, cta_label, cta_url, placement, status, sort_order, metadata)
  VALUES (
    'home_samples_mock',
    'Mẫu sản phẩm nổi bật',
    'Một vài mẫu demo để test media, RLS và homepage RPC.',
    'Các URL ảnh là metadata demo; anh cần upload file thật vào Storage nếu muốn ảnh hiển thị.',
    'Xem tất cả',
    '/samples',
    'home',
    'active',
    20,
    '{"seed": true}'::jsonb
  )
  ON CONFLICT (section_key) DO UPDATE
  SET title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      body = EXCLUDED.body,
      cta_label = EXCLUDED.cta_label,
      cta_url = EXCLUDED.cta_url,
      placement = EXCLUDED.placement,
      status = EXCLUDED.status,
      sort_order = EXCLUDED.sort_order,
      metadata = content_sections.metadata || EXCLUDED.metadata
  RETURNING id INTO samples_section_id;

  INSERT INTO content_section_media (content_section_id, media_type, bucket, storage_path, public_url, alt_text, sort_order, status)
  VALUES
    (
      hero_section_id,
      'image',
      'content-media',
      'mock/home/hero-print-shop.jpg',
      '/storage/v1/object/public/content-media/mock/home/hero-print-shop.jpg',
      'Không gian in ấn demo',
      10,
      'active'
    ),
    (
      samples_section_id,
      'image',
      'content-media',
      'mock/home/featured-samples.jpg',
      '/storage/v1/object/public/content-media/mock/home/featured-samples.jpg',
      'Các mẫu sản phẩm in demo',
      10,
      'active'
    )
  ON CONFLICT (bucket, storage_path) DO UPDATE
  SET content_section_id = EXCLUDED.content_section_id,
      media_type = EXCLUDED.media_type,
      public_url = EXCLUDED.public_url,
      alt_text = EXCLUDED.alt_text,
      sort_order = EXCLUDED.sort_order,
      status = EXCLUDED.status;

  -- ---------- Site settings ----------
  INSERT INTO site_settings (key, value, is_public)
  VALUES
    ('brand', '{"name": "Ecom Shopcard", "hotline": "0900 000 000", "email": "hello@example.com"}'::jsonb, TRUE),
    ('homepage', '{"featuredProductTypeSlugs": ["business-cards", "stickers"], "showSamples": true}'::jsonb, TRUE),
    ('seo', '{"title": "Ecom Shopcard Demo", "description": "Mock data for Supabase prompt architecture schema."}'::jsonb, TRUE),
    ('admin_notes', '{"message": "Private mock setting visible to admins only."}'::jsonb, FALSE)
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      is_public = EXCLUDED.is_public,
      updated_at = NOW();

  -- ---------- Contact messages ----------
  IF NOT EXISTS (
    SELECT 1 FROM contact_messages
    WHERE metadata->>'seed_key' = 'mock_contact_001'
  ) THEN
    INSERT INTO contact_messages (name, email, phone, subject, message, status, source, metadata)
    VALUES (
      'Nguyen Demo',
      'demo@example.com',
      '0900000001',
      'Yêu cầu báo giá card visit',
      'Tôi cần in 500 card visit 2 mặt, giấy couche 300gsm, cán mờ.',
      'new',
      'mock_seed',
      '{"seed": true, "seed_key": "mock_contact_001"}'::jsonb
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM audit_logs
    WHERE metadata->>'seed_key' = 'mock_audit_001'
  ) THEN
    INSERT INTO audit_logs (actor_email, action, entity_type, entity_id, new_values, metadata)
    VALUES (
      'seed@example.com',
      'seed',
      'database',
      'mock_data',
      '{"message": "Mock data inserted"}'::jsonb,
      '{"seed": true, "seed_key": "mock_audit_001"}'::jsonb
    );
  END IF;
END;
$$;

COMMIT;

-- Quick smoke checks:
-- SELECT get_homepage_data();
-- SELECT get_product_type_detail('business-cards');
-- SELECT get_active_price_table('business-cards');
