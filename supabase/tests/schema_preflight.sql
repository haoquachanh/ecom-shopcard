-- ======================================================
-- ECOM SHOPCARD SCHEMA PREFLIGHT TESTS
--
-- Run after applying supabase/migrations/001_prompt_architecture_schema.sql.
-- Intended for Supabase SQL Editor or psql connected as a privileged role.
-- The whole script runs inside a transaction and rolls back test data.
-- ======================================================

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.assert_true(condition BOOLEAN, label TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT COALESCE(condition, FALSE) THEN
    RAISE EXCEPTION 'ASSERT FAILED: %', label;
  END IF;

  RAISE NOTICE 'ok: %', label;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.assert_eq(actual BIGINT, expected BIGINT, label TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'ASSERT FAILED: %, expected %, got %', label, expected, actual;
  END IF;

  RAISE NOTICE 'ok: %', label;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.expect_error(sql TEXT, label TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  failed_as_expected BOOLEAN := FALSE;
  error_message TEXT;
BEGIN
  BEGIN
    EXECUTE sql;
  EXCEPTION WHEN OTHERS THEN
    failed_as_expected := TRUE;
    error_message := SQLERRM;
  END;

  IF NOT failed_as_expected THEN
    RAISE EXCEPTION 'ASSERT FAILED: %, expected SQL error but statement succeeded', label;
  END IF;

  RAISE NOTICE 'ok: % -> %', label, error_message;
END;
$$;

-- Stable test identities. Rolled back at the end.
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'authenticated',
    'authenticated',
    'schema-admin@example.test',
    'test',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'authenticated',
    'authenticated',
    'schema-user@example.test',
    'test',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO admin_users (user_id, email, display_name, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  'schema-admin@example.test',
  'Schema Admin',
  TRUE
)
ON CONFLICT (user_id) DO UPDATE
SET is_active = EXCLUDED.is_active,
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name;

-- Seed public/private product rows as owner.
INSERT INTO product_types (name, slug, status, sort_order, deleted_at)
VALUES
  ('RLS Active Product', 'preflight-active-product', 'active', 1, NULL),
  ('RLS Draft Product', 'preflight-draft-product', 'draft', 2, NULL),
  ('RLS Inactive Product', 'preflight-inactive-product', 'inactive', 3, NULL),
  ('RLS Archived Product', 'preflight-archived-product', 'archived', 4, NULL),
  ('RLS Deleted Product', 'preflight-deleted-product', 'active', 5, NOW());

-- Anon can read active public rows only.
SET LOCAL ROLE anon;
SELECT pg_temp.assert_eq(
  (SELECT COUNT(*)::BIGINT FROM product_types WHERE slug LIKE 'preflight-%-product'),
  1,
  'anon sees only active non-deleted product types'
);
SELECT pg_temp.assert_true(
  EXISTS (SELECT 1 FROM product_types WHERE slug = 'preflight-active-product'),
  'anon can read active product type'
);
SELECT pg_temp.assert_true(
  NOT EXISTS (
    SELECT 1
    FROM product_types
    WHERE slug IN (
      'preflight-draft-product',
      'preflight-inactive-product',
      'preflight-archived-product',
      'preflight-deleted-product'
    )
  ),
  'anon cannot read draft/inactive/archived/deleted product types'
);
SELECT pg_temp.expect_error(
  $$INSERT INTO product_types (name, slug, status) VALUES ('Anon Write', 'preflight-anon-write', 'active')$$,
  'anon cannot insert product types'
);
RESET ROLE;

-- Non-admin authenticated users can read public data but cannot mutate admin tables.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', TRUE);
SELECT pg_temp.assert_eq(
  (SELECT COUNT(*)::BIGINT FROM product_types WHERE slug LIKE 'preflight-%-product'),
  1,
  'non-admin authenticated user sees public active rows only'
);
SELECT pg_temp.expect_error(
  $$INSERT INTO product_types (name, slug, status) VALUES ('Non Admin Write', 'preflight-user-write', 'active')$$,
  'non-admin authenticated user cannot insert product types'
);
RESET ROLE;

-- Admin authenticated user can insert/update/delete.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', TRUE);
INSERT INTO product_types (name, slug, status)
VALUES ('Admin CRUD Product', 'preflight-admin-crud', 'draft');
UPDATE product_types
SET status = 'active'
WHERE slug = 'preflight-admin-crud';
DELETE FROM product_types
WHERE slug = 'preflight-admin-crud';
SELECT pg_temp.assert_true(
  NOT EXISTS (SELECT 1 FROM product_types WHERE slug = 'preflight-admin-crud'),
  'admin can insert/update/delete product types'
);
RESET ROLE;

-- Seed dynamic pricing model as owner for constraint tests.
INSERT INTO product_types (name, slug, status)
VALUES
  ('Preflight Product A', 'preflight-product-a', 'active'),
  ('Preflight Product B', 'preflight-product-b', 'active');

INSERT INTO pricing_factors (factor_key, label, factor_type, status, sort_order)
VALUES
  ('preflight_material', 'Material', 'select', 'active', 1),
  ('preflight_quantity', 'Quantity', 'quantity_range', 'active', 2),
  ('preflight_flag', 'Flag', 'boolean', 'active', 3),
  ('preflight_note', 'Note', 'text', 'active', 4);

INSERT INTO product_type_factors (product_type_id, factor_id, sort_order)
SELECT product_types.id, pricing_factors.id, 1
FROM product_types, pricing_factors
WHERE product_types.slug = 'preflight-product-a'
  AND pricing_factors.factor_key = 'preflight_material';

INSERT INTO product_type_factors (product_type_id, factor_id, sort_order)
SELECT product_types.id, pricing_factors.id, 2
FROM product_types, pricing_factors
WHERE product_types.slug = 'preflight-product-a'
  AND pricing_factors.factor_key = 'preflight_quantity';

INSERT INTO product_type_factors (product_type_id, factor_id, sort_order)
SELECT product_types.id, pricing_factors.id, 3
FROM product_types, pricing_factors
WHERE product_types.slug = 'preflight-product-a'
  AND pricing_factors.factor_key = 'preflight_flag';

INSERT INTO product_type_factors (product_type_id, factor_id, sort_order)
SELECT product_types.id, pricing_factors.id, 4
FROM product_types, pricing_factors
WHERE product_types.slug = 'preflight-product-a'
  AND pricing_factors.factor_key = 'preflight_note';

INSERT INTO product_type_factors (product_type_id, factor_id, sort_order)
SELECT product_types.id, pricing_factors.id, 1
FROM product_types, pricing_factors
WHERE product_types.slug = 'preflight-product-b'
  AND pricing_factors.factor_key = 'preflight_material';

INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label)
SELECT product_type_factors.id, 'pvc', 'PVC'
FROM product_type_factors
JOIN product_types ON product_types.id = product_type_factors.product_type_id
JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
WHERE product_types.slug = 'preflight-product-a'
  AND pricing_factors.factor_key = 'preflight_material';

INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label)
SELECT product_type_factors.id, 'acrylic', 'Acrylic'
FROM product_type_factors
JOIN product_types ON product_types.id = product_type_factors.product_type_id
JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
WHERE product_types.slug = 'preflight-product-b'
  AND pricing_factors.factor_key = 'preflight_material';

INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, min_number, max_number)
SELECT product_type_factors.id, 'qty_1_10', '1-10', 1, 10
FROM product_type_factors
JOIN product_types ON product_types.id = product_type_factors.product_type_id
JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
WHERE product_types.slug = 'preflight-product-a'
  AND pricing_factors.factor_key = 'preflight_quantity';

SELECT pg_temp.expect_error(
  $$
    INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label, min_number, max_number)
    SELECT product_type_factors.id, 'qty_5_20', '5-20', 5, 20
    FROM product_type_factors
    JOIN product_types ON product_types.id = product_type_factors.product_type_id
    JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
    WHERE product_types.slug = 'preflight-product-a'
      AND pricing_factors.factor_key = 'preflight_quantity'
  $$,
  'overlapping quantity ranges are rejected'
);

SELECT pg_temp.expect_error(
  $$
    INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label)
    SELECT product_type_factors.id, 'bad_boolean', 'Bad Boolean'
    FROM product_type_factors
    JOIN product_types ON product_types.id = product_type_factors.product_type_id
    JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
    WHERE product_types.slug = 'preflight-product-a'
      AND pricing_factors.factor_key = 'preflight_flag'
  $$,
  'boolean factor values require boolean_value'
);

SELECT pg_temp.expect_error(
  $$
    INSERT INTO product_type_factor_values (product_type_factor_id, value_key, label)
    SELECT product_type_factors.id, 'bad_text', 'Bad Text'
    FROM product_type_factors
    JOIN product_types ON product_types.id = product_type_factors.product_type_id
    JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
    WHERE product_types.slug = 'preflight-product-a'
      AND pricing_factors.factor_key = 'preflight_note'
  $$,
  'text factor values require text_value'
);

INSERT INTO price_tables (product_type_id, name, slug, status, version)
SELECT id, 'Preflight Active Price Table', 'preflight-active', 'active', 1
FROM product_types
WHERE slug = 'preflight-product-a';

SELECT pg_temp.expect_error(
  $$
    INSERT INTO price_tables (product_type_id, name, slug, status, version)
    SELECT id, 'Second Active Price Table', 'preflight-second-active', 'active', 2
    FROM product_types
    WHERE slug = 'preflight-product-a'
  $$,
  'only one active price table exists per product type'
);

INSERT INTO price_rules (price_table_id, condition_hash, pricing_mode, price_vnd)
SELECT price_tables.id, 'preflight_material:pvc|preflight_quantity:qty_1_10', 'per_unit', 10000
FROM price_tables
JOIN product_types ON product_types.id = price_tables.product_type_id
WHERE product_types.slug = 'preflight-product-a'
  AND price_tables.slug = 'preflight-active';

-- Valid mapping: condition factor and value both belong to product A material.
INSERT INTO price_rule_conditions (price_rule_id, product_type_factor_id, factor_value_id, operator, value_key)
SELECT price_rules.id, product_type_factors.id, product_type_factor_values.id, 'eq', product_type_factor_values.value_key
FROM price_rules
JOIN price_tables ON price_tables.id = price_rules.price_table_id
JOIN product_types ON product_types.id = price_tables.product_type_id
JOIN product_type_factors ON product_type_factors.product_type_id = product_types.id
JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
JOIN product_type_factor_values ON product_type_factor_values.product_type_factor_id = product_type_factors.id
WHERE product_types.slug = 'preflight-product-a'
  AND pricing_factors.factor_key = 'preflight_material'
  AND product_type_factor_values.value_key = 'pvc';

SELECT pg_temp.expect_error(
  $$
    INSERT INTO price_rule_conditions (price_rule_id, product_type_factor_id, factor_value_id, operator, value_key)
    SELECT price_rules.id, a_factor.id, b_value.id, 'eq', b_value.value_key
    FROM price_rules
    JOIN price_tables ON price_tables.id = price_rules.price_table_id
    JOIN product_types a_product ON a_product.id = price_tables.product_type_id
    JOIN product_type_factors a_factor ON a_factor.product_type_id = a_product.id
    JOIN pricing_factors a_pricing_factor ON a_pricing_factor.id = a_factor.factor_id
    JOIN product_type_factor_values b_value ON b_value.value_key = 'acrylic'
    JOIN product_type_factors b_factor ON b_factor.id = b_value.product_type_factor_id
    JOIN product_types b_product ON b_product.id = b_factor.product_type_id
    WHERE a_product.slug = 'preflight-product-a'
      AND b_product.slug = 'preflight-product-b'
      AND a_pricing_factor.factor_key = 'preflight_quantity'
  $$,
  'factor_value_id must belong to the same product_type_factor_id'
);

SELECT pg_temp.expect_error(
  $$
    INSERT INTO price_rule_conditions (price_rule_id, product_type_factor_id, operator, value_key)
    SELECT price_rules.id, b_factor.id, 'eq', 'acrylic'
    FROM price_rules
    JOIN price_tables ON price_tables.id = price_rules.price_table_id
    JOIN product_types a_product ON a_product.id = price_tables.product_type_id
    JOIN product_types b_product ON b_product.slug = 'preflight-product-b'
    JOIN product_type_factors b_factor ON b_factor.product_type_id = b_product.id
    JOIN pricing_factors ON pricing_factors.id = b_factor.factor_id
    WHERE a_product.slug = 'preflight-product-a'
      AND pricing_factors.factor_key = 'preflight_material'
  $$,
  'price rule condition factor must belong to the same product type as the price table'
);

-- RPC smoke tests as anon.
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true(
  get_homepage_data() ? 'productTypes',
  'get_homepage_data returns productTypes key for anon'
);
SELECT pg_temp.assert_true(
  get_product_type_detail('preflight-product-a') ? 'productType',
  'get_product_type_detail returns productType key for anon'
);
SELECT pg_temp.assert_true(
  get_active_price_table('preflight-product-a') ? 'priceTable',
  'get_active_price_table returns active price table for anon'
);
RESET ROLE;

ROLLBACK;
