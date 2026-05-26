-- ======================================================
-- ECOM SHOPCARD PROMPT-ALIGNED SCHEMA
-- Public frontend: read active public rows only.
-- Admin Electron: mutate through IPC -> main service -> repository.
-- Supabase/Postgres: online source of truth + Storage metadata.
-- ======================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Enum helpers ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'public_record_status') THEN
    CREATE TYPE public_record_status AS ENUM ('draft', 'active', 'inactive', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_factor_type') THEN
    CREATE TYPE pricing_factor_type AS ENUM ('select', 'quantity_range', 'number_range', 'boolean', 'text');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_table_status') THEN
    CREATE TYPE price_table_status AS ENUM ('draft', 'active', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_rule_status') THEN
    CREATE TYPE price_rule_status AS ENUM ('draft', 'active', 'inactive');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_rule_pricing_mode') THEN
    CREATE TYPE price_rule_pricing_mode AS ENUM ('fixed_total', 'per_unit', 'quote_required');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_condition_operator') THEN
    CREATE TYPE price_condition_operator AS ENUM ('eq', 'range', 'gte', 'lte', 'contains', 'is');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE media_type AS ENUM ('image', 'video');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_message_status') THEN
    CREATE TYPE contact_message_status AS ENUM ('new', 'read', 'replied', 'archived');
  END IF;
END;
$$;

-- ---------- Admin auth mapping for Supabase Auth/RLS ----------
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = TRUE
  );
$$;

-- ---------- Product catalog ----------
CREATE TABLE IF NOT EXISTS product_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  status public_record_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compatibility for projects that already had the legacy product_types table.
-- CREATE TABLE IF NOT EXISTS does not add missing columns to an existing table.
ALTER TABLE product_types
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS status public_record_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
DECLARE
  legacy_fk RECORD;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_types'
      AND column_name = 'is_active'
  ) THEN
    UPDATE product_types
    SET status = CASE
      WHEN is_active = TRUE THEN 'active'::public_record_status
      ELSE 'inactive'::public_record_status
    END
    WHERE status = 'draft';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_types'
      AND column_name = 'id'
      AND data_type = 'integer'
  ) THEN
    FOR legacy_fk IN
      SELECT conrelid::regclass AS table_name, conname
      FROM pg_constraint
      WHERE contype = 'f'
        AND confrelid = 'product_types'::regclass
    LOOP
      EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', legacy_fk.table_name, legacy_fk.conname);
    END LOOP;

    ALTER TABLE product_types ALTER COLUMN id TYPE BIGINT;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_types_slug_prompt ON product_types(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_types_public_prompt ON product_types(status, deleted_at, sort_order, id);

-- ---------- Dynamic pricing factors ----------
CREATE TABLE IF NOT EXISTS pricing_factors (
  id BIGSERIAL PRIMARY KEY,
  factor_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  factor_type pricing_factor_type NOT NULL DEFAULT 'select',
  unit TEXT,
  status public_record_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pricing_factors_key CHECK (factor_key ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX IF NOT EXISTS idx_pricing_factors_public ON pricing_factors(status, sort_order, id);

CREATE TABLE IF NOT EXISTS product_type_factors (
  id BIGSERIAL PRIMARY KEY,
  product_type_id BIGINT NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
  factor_id BIGINT NOT NULL REFERENCES pricing_factors(id) ON DELETE RESTRICT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  status public_record_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_type_factors UNIQUE (product_type_id, factor_id)
);

CREATE INDEX IF NOT EXISTS idx_product_type_factors_product ON product_type_factors(product_type_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_type_factors_factor ON product_type_factors(factor_id);

CREATE TABLE IF NOT EXISTS product_type_factor_values (
  id BIGSERIAL PRIMARY KEY,
  product_type_factor_id BIGINT NOT NULL REFERENCES product_type_factors(id) ON DELETE CASCADE,
  value_key TEXT NOT NULL,
  label TEXT NOT NULL,
  min_number NUMERIC(14,4),
  max_number NUMERIC(14,4),
  numeric_value NUMERIC(14,4),
  text_value TEXT,
  boolean_value BOOLEAN,
  status public_record_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_type_factor_values UNIQUE (product_type_factor_id, value_key),
  CONSTRAINT uq_factor_values_id_product_type_factor UNIQUE (id, product_type_factor_id),
  CONSTRAINT chk_factor_value_key CHECK (value_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  CONSTRAINT chk_factor_value_range CHECK (
    min_number IS NULL
    OR max_number IS NULL
    OR max_number >= min_number
  )
);

CREATE INDEX IF NOT EXISTS idx_factor_values_factor ON product_type_factor_values(product_type_factor_id, status, sort_order);

-- ---------- Price tables and rules ----------
CREATE TABLE IF NOT EXISTS price_tables (
  id BIGSERIAL PRIMARY KEY,
  product_type_id BIGINT NOT NULL REFERENCES product_types(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT,
  status price_table_status NOT NULL DEFAULT 'draft',
  version INT NOT NULL DEFAULT 1,
  currency CHAR(3) NOT NULL DEFAULT 'VND',
  cloned_from_id BIGINT REFERENCES price_tables(id) ON DELETE SET NULL,
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_price_tables_effective_range CHECK (
    effective_from IS NULL
    OR effective_to IS NULL
    OR effective_to > effective_from
  )
);

CREATE INDEX IF NOT EXISTS idx_price_tables_product_status ON price_tables(product_type_id, status, version DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_price_tables_active_product
  ON price_tables(product_type_id)
  WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_price_tables_product_version
  ON price_tables(product_type_id, version);
CREATE UNIQUE INDEX IF NOT EXISTS uq_price_tables_product_slug
  ON price_tables(product_type_id, slug)
  WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS price_rules (
  id BIGSERIAL PRIMARY KEY,
  price_table_id BIGINT NOT NULL REFERENCES price_tables(id) ON DELETE CASCADE,
  condition_hash TEXT NOT NULL,
  pricing_mode price_rule_pricing_mode NOT NULL DEFAULT 'per_unit',
  price_vnd INTEGER CHECK (price_vnd IS NULL OR price_vnd >= 0),
  min_order_amount_vnd INTEGER CHECK (min_order_amount_vnd IS NULL OR min_order_amount_vnd >= 0),
  status price_rule_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_price_rules_condition UNIQUE (price_table_id, condition_hash),
  CONSTRAINT chk_price_rules_quote_price CHECK (
    pricing_mode = 'quote_required'
    OR price_vnd IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_price_rules_table_status ON price_rules(price_table_id, status, sort_order, id);

CREATE TABLE IF NOT EXISTS price_rule_conditions (
  id BIGSERIAL PRIMARY KEY,
  price_rule_id BIGINT NOT NULL REFERENCES price_rules(id) ON DELETE CASCADE,
  product_type_factor_id BIGINT NOT NULL REFERENCES product_type_factors(id) ON DELETE RESTRICT,
  factor_value_id BIGINT,
  operator price_condition_operator NOT NULL DEFAULT 'eq',
  value_key TEXT,
  min_number NUMERIC(14,4),
  max_number NUMERIC(14,4),
  text_value TEXT,
  boolean_value BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_price_rule_conditions_factor UNIQUE (price_rule_id, product_type_factor_id),
  CONSTRAINT fk_price_condition_value_belongs_to_factor
    FOREIGN KEY (factor_value_id, product_type_factor_id)
    REFERENCES product_type_factor_values(id, product_type_factor_id),
  CONSTRAINT chk_price_condition_range CHECK (
    min_number IS NULL
    OR max_number IS NULL
    OR max_number >= min_number
  )
);

CREATE INDEX IF NOT EXISTS idx_price_rule_conditions_rule ON price_rule_conditions(price_rule_id);
CREATE INDEX IF NOT EXISTS idx_price_rule_conditions_factor_value ON price_rule_conditions(factor_value_id);
CREATE INDEX IF NOT EXISTS idx_price_rule_conditions_product_type_factor ON price_rule_conditions(product_type_factor_id);

CREATE OR REPLACE FUNCTION validate_price_rule_condition_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  table_product_type_id BIGINT;
  factor_product_type_id BIGINT;
BEGIN
  SELECT price_tables.product_type_id
  INTO table_product_type_id
  FROM price_rules
  JOIN price_tables ON price_tables.id = price_rules.price_table_id
  WHERE price_rules.id = NEW.price_rule_id;

  SELECT product_type_factors.product_type_id
  INTO factor_product_type_id
  FROM product_type_factors
  WHERE product_type_factors.id = NEW.product_type_factor_id;

  IF table_product_type_id IS NULL OR factor_product_type_id IS NULL THEN
    RAISE EXCEPTION 'Price rule condition references missing price rule or product type factor';
  END IF;

  IF table_product_type_id <> factor_product_type_id THEN
    RAISE EXCEPTION 'Price rule condition factor does not belong to the price table product type';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_price_rule_condition_scope ON price_rule_conditions;
CREATE TRIGGER trg_validate_price_rule_condition_scope
BEFORE INSERT OR UPDATE ON price_rule_conditions
FOR EACH ROW EXECUTE FUNCTION validate_price_rule_condition_scope();

-- ---------- Quantity range overlap guard ----------
CREATE OR REPLACE FUNCTION prevent_factor_value_range_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_factor_type pricing_factor_type;
BEGIN
  SELECT pricing_factors.factor_type
  INTO current_factor_type
  FROM product_type_factors
  JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
  WHERE product_type_factors.id = NEW.product_type_factor_id;

  IF current_factor_type NOT IN ('quantity_range', 'number_range') THEN
    RETURN NEW;
  END IF;

  IF NEW.min_number IS NULL THEN
    RAISE EXCEPTION 'Range factor value % requires min_number', NEW.value_key;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM product_type_factor_values existing
    WHERE existing.product_type_factor_id = NEW.product_type_factor_id
      AND existing.id <> COALESCE(NEW.id, 0)
      AND existing.min_number IS NOT NULL
      AND existing.status <> 'archived'
      AND NEW.status <> 'archived'
      AND numrange(
        existing.min_number,
        existing.max_number,
        '[]'
      ) && numrange(
        NEW.min_number,
        NEW.max_number,
        '[]'
      )
  ) THEN
    RAISE EXCEPTION 'Range factor value % overlaps an existing range', NEW.value_key;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_factor_value_range_overlap ON product_type_factor_values;
CREATE TRIGGER trg_factor_value_range_overlap
BEFORE INSERT OR UPDATE ON product_type_factor_values
FOR EACH ROW EXECUTE FUNCTION prevent_factor_value_range_overlap();

CREATE OR REPLACE FUNCTION validate_factor_value_by_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_factor_type pricing_factor_type;
BEGIN
  SELECT pricing_factors.factor_type
  INTO current_factor_type
  FROM product_type_factors
  JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
  WHERE product_type_factors.id = NEW.product_type_factor_id;

  IF current_factor_type IN ('quantity_range', 'number_range') AND NEW.min_number IS NULL THEN
    RAISE EXCEPTION 'Range value % requires min_number', NEW.value_key;
  END IF;

  IF current_factor_type = 'boolean' AND NEW.boolean_value IS NULL THEN
    RAISE EXCEPTION 'Boolean value % requires boolean_value', NEW.value_key;
  END IF;

  IF current_factor_type = 'text' AND NULLIF(BTRIM(COALESCE(NEW.text_value, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Text value % requires text_value', NEW.value_key;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_factor_value_by_type ON product_type_factor_values;
CREATE TRIGGER trg_validate_factor_value_by_type
BEFORE INSERT OR UPDATE ON product_type_factor_values
FOR EACH ROW EXECUTE FUNCTION validate_factor_value_by_type();

-- ---------- Public sample products and media ----------
CREATE TABLE IF NOT EXISTS sample_products (
  id BIGSERIAL PRIMARY KEY,
  product_type_id BIGINT NOT NULL REFERENCES product_types(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status public_record_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sample_products_public ON sample_products(product_type_id, status, deleted_at, sort_order, id);

CREATE TABLE IF NOT EXISTS sample_product_media (
  id BIGSERIAL PRIMARY KEY,
  sample_product_id BIGINT NOT NULL REFERENCES sample_products(id) ON DELETE CASCADE,
  media_type media_type NOT NULL DEFAULT 'image',
  bucket TEXT NOT NULL DEFAULT 'product-samples',
  storage_path TEXT NOT NULL,
  public_url TEXT,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  status public_record_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_sample_media_storage_path UNIQUE (bucket, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_sample_media_sample ON sample_product_media(sample_product_id, status, is_primary DESC, sort_order, id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sample_media_primary
  ON sample_product_media(sample_product_id)
  WHERE is_primary = TRUE AND status = 'active';

-- ---------- Content and contact ----------
CREATE TABLE IF NOT EXISTS content_sections (
  id BIGSERIAL PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  body TEXT,
  cta_label TEXT,
  cta_url TEXT,
  placement TEXT NOT NULL DEFAULT 'home',
  status public_record_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_sections_public ON content_sections(placement, status, sort_order, id);

CREATE TABLE IF NOT EXISTS content_section_media (
  id BIGSERIAL PRIMARY KEY,
  content_section_id BIGINT NOT NULL REFERENCES content_sections(id) ON DELETE CASCADE,
  media_type media_type NOT NULL DEFAULT 'image',
  bucket TEXT NOT NULL DEFAULT 'content-media',
  storage_path TEXT NOT NULL,
  public_url TEXT,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status public_record_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_content_media_storage_path UNIQUE (bucket, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_content_media_section ON content_section_media(content_section_id, status, sort_order, id);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status contact_message_status NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'public_frontend',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages(status, created_at DESC);

-- ---------- Audit ----------
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);

-- ---------- Public helper views/RPC ----------
CREATE OR REPLACE VIEW public_active_product_types AS
SELECT id, name, slug, description, image_url, sort_order, metadata, created_at, updated_at
FROM product_types
WHERE status = 'active'
  AND deleted_at IS NULL;

CREATE OR REPLACE FUNCTION get_active_price_table(product_type_slug TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'productType', to_jsonb(pt),
    'priceTable', to_jsonb(price_tables),
    'factors', COALESCE(factors.payload, '[]'::jsonb),
    'rules', COALESCE(rules.payload, '[]'::jsonb)
  )
  FROM product_types pt
  JOIN price_tables
    ON price_tables.product_type_id = pt.id
   AND price_tables.status = 'active'
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'productTypeFactor', to_jsonb(product_type_factors),
        'factor', to_jsonb(pricing_factors),
        'values', COALESCE(factor_values.payload, '[]'::jsonb)
      )
      ORDER BY product_type_factors.sort_order, product_type_factors.id
    ) AS payload
    FROM product_type_factors
    JOIN pricing_factors ON pricing_factors.id = product_type_factors.factor_id
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(to_jsonb(product_type_factor_values) ORDER BY sort_order, id) AS payload
      FROM product_type_factor_values
      WHERE product_type_factor_values.product_type_factor_id = product_type_factors.id
        AND product_type_factor_values.status = 'active'
    ) factor_values ON TRUE
    WHERE product_type_factors.product_type_id = pt.id
      AND product_type_factors.status = 'active'
      AND pricing_factors.status = 'active'
  ) factors ON TRUE
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'rule', to_jsonb(price_rules),
        'conditions', COALESCE(conditions.payload, '[]'::jsonb)
      )
      ORDER BY price_rules.sort_order, price_rules.id
    ) AS payload
    FROM price_rules
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(to_jsonb(price_rule_conditions) ORDER BY id) AS payload
      FROM price_rule_conditions
      WHERE price_rule_conditions.price_rule_id = price_rules.id
    ) conditions ON TRUE
    WHERE price_rules.price_table_id = price_tables.id
      AND price_rules.status = 'active'
  ) rules ON TRUE
  WHERE pt.slug = product_type_slug
    AND pt.status = 'active'
    AND pt.deleted_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_product_type_detail(product_type_slug TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'productType', to_jsonb(pt),
    'samples', COALESCE(samples.payload, '[]'::jsonb),
    'priceTable', get_active_price_table(product_type_slug)
  )
  FROM product_types pt
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'sample', to_jsonb(sample_products),
        'media', COALESCE(media.payload, '[]'::jsonb)
      )
      ORDER BY sample_products.sort_order, sample_products.id
    ) AS payload
    FROM sample_products
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(to_jsonb(sample_product_media) ORDER BY is_primary DESC, sort_order, id) AS payload
      FROM sample_product_media
      WHERE sample_product_media.sample_product_id = sample_products.id
        AND sample_product_media.status = 'active'
    ) media ON TRUE
    WHERE sample_products.product_type_id = pt.id
      AND sample_products.status = 'active'
      AND sample_products.deleted_at IS NULL
  ) samples ON TRUE
  WHERE pt.slug = product_type_slug
    AND pt.status = 'active'
    AND pt.deleted_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_homepage_data()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'settings', COALESCE(settings.payload, '{}'::jsonb),
    'productTypes', COALESCE(product_types_payload.payload, '[]'::jsonb),
    'sections', COALESCE(sections.payload, '[]'::jsonb)
  )
  FROM (SELECT 1) seed
  LEFT JOIN LATERAL (
    SELECT jsonb_object_agg(key, value) AS payload
    FROM site_settings
    WHERE is_public = TRUE
  ) settings ON TRUE
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(to_jsonb(public_active_product_types) ORDER BY sort_order, id) AS payload
    FROM public_active_product_types
  ) product_types_payload ON TRUE
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'section', to_jsonb(content_sections),
        'media', COALESCE(media.payload, '[]'::jsonb)
      )
      ORDER BY content_sections.sort_order, content_sections.id
    ) AS payload
    FROM content_sections
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(to_jsonb(content_section_media) ORDER BY sort_order, id) AS payload
      FROM content_section_media
      WHERE content_section_media.content_section_id = content_sections.id
        AND content_section_media.status = 'active'
    ) media ON TRUE
    WHERE content_sections.status = 'active'
      AND (content_sections.starts_at IS NULL OR content_sections.starts_at <= NOW())
      AND (content_sections.ends_at IS NULL OR content_sections.ends_at >= NOW())
  ) sections ON TRUE;
$$;

CREATE OR REPLACE FUNCTION publish_price_table(target_price_table_id BIGINT)
RETURNS price_tables
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_table price_tables%ROWTYPE;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin users can publish price tables';
  END IF;

  SELECT *
  INTO target_table
  FROM price_tables
  WHERE id = target_price_table_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Price table % not found', target_price_table_id;
  END IF;

  UPDATE price_tables
  SET status = 'archived',
      updated_at = NOW()
  WHERE product_type_id = target_table.product_type_id
    AND status = 'active'
    AND id <> target_price_table_id;

  UPDATE price_tables
  SET status = 'active',
      published_at = NOW(),
      published_by = auth.uid(),
      updated_at = NOW()
  WHERE id = target_price_table_id
  RETURNING * INTO target_table;

  INSERT INTO audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    new_values
  )
  VALUES (
    auth.uid(),
    'publish',
    'price_table',
    target_table.id::TEXT,
    to_jsonb(target_table)
  );

  RETURN target_table;
END;
$$;

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON admin_users;
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_product_types_updated_at_prompt ON product_types;
CREATE TRIGGER trg_product_types_updated_at_prompt BEFORE UPDATE ON product_types
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_pricing_factors_updated_at ON pricing_factors;
CREATE TRIGGER trg_pricing_factors_updated_at BEFORE UPDATE ON pricing_factors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_product_type_factors_updated_at ON product_type_factors;
CREATE TRIGGER trg_product_type_factors_updated_at BEFORE UPDATE ON product_type_factors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_product_type_factor_values_updated_at ON product_type_factor_values;
CREATE TRIGGER trg_product_type_factor_values_updated_at BEFORE UPDATE ON product_type_factor_values
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_price_tables_updated_at ON price_tables;
CREATE TRIGGER trg_price_tables_updated_at BEFORE UPDATE ON price_tables
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_price_rules_updated_at ON price_rules;
CREATE TRIGGER trg_price_rules_updated_at BEFORE UPDATE ON price_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sample_products_updated_at ON sample_products;
CREATE TRIGGER trg_sample_products_updated_at BEFORE UPDATE ON sample_products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sample_product_media_updated_at ON sample_product_media;
CREATE TRIGGER trg_sample_product_media_updated_at BEFORE UPDATE ON sample_product_media
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_content_sections_updated_at ON content_sections;
CREATE TRIGGER trg_content_sections_updated_at BEFORE UPDATE ON content_sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_content_section_media_updated_at ON content_section_media;
CREATE TRIGGER trg_content_section_media_updated_at BEFORE UPDATE ON content_section_media
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at BEFORE UPDATE ON contact_messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------- RLS ----------
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_type_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_type_factor_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rule_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_section_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE
  public_active_product_types,
  product_types,
  pricing_factors,
  product_type_factors,
  product_type_factor_values,
  price_tables,
  price_rules,
  price_rule_conditions,
  sample_products,
  sample_product_media,
  content_sections,
  content_section_media,
  site_settings
TO anon, authenticated;

GRANT EXECUTE ON FUNCTION get_active_price_table(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_product_type_detail(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_homepage_data() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION publish_price_table(BIGINT) TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  admin_users,
  product_types,
  pricing_factors,
  product_type_factors,
  product_type_factor_values,
  price_tables,
  price_rules,
  price_rule_conditions,
  sample_products,
  sample_product_media,
  content_sections,
  content_section_media,
  site_settings,
  contact_messages,
  audit_logs
TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT INSERT ON TABLE contact_messages TO anon;
GRANT USAGE, SELECT ON SEQUENCE contact_messages_id_seq TO anon;

-- Public read policies.
DROP POLICY IF EXISTS "Public active product types prompt" ON product_types;
CREATE POLICY "Public active product types prompt"
ON product_types FOR SELECT
TO anon, authenticated
USING (status = 'active' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Public active pricing factors" ON pricing_factors;
CREATE POLICY "Public active pricing factors"
ON pricing_factors FOR SELECT
TO anon, authenticated
USING (status = 'active');

DROP POLICY IF EXISTS "Public active product type factors" ON product_type_factors;
CREATE POLICY "Public active product type factors"
ON product_type_factors FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1 FROM product_types
    WHERE product_types.id = product_type_factors.product_type_id
      AND product_types.status = 'active'
      AND product_types.deleted_at IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM pricing_factors
    WHERE pricing_factors.id = product_type_factors.factor_id
      AND pricing_factors.status = 'active'
  )
);

DROP POLICY IF EXISTS "Public active factor values" ON product_type_factor_values;
CREATE POLICY "Public active factor values"
ON product_type_factor_values FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1
    FROM product_type_factors
    JOIN product_types ON product_types.id = product_type_factors.product_type_id
    WHERE product_type_factors.id = product_type_factor_values.product_type_factor_id
      AND product_type_factors.status = 'active'
      AND product_types.status = 'active'
      AND product_types.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Public active price tables" ON price_tables;
CREATE POLICY "Public active price tables"
ON price_tables FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1 FROM product_types
    WHERE product_types.id = price_tables.product_type_id
      AND product_types.status = 'active'
      AND product_types.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Public active price rules" ON price_rules;
CREATE POLICY "Public active price rules"
ON price_rules FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1
    FROM price_tables
    JOIN product_types ON product_types.id = price_tables.product_type_id
    WHERE price_tables.id = price_rules.price_table_id
      AND price_tables.status = 'active'
      AND product_types.status = 'active'
      AND product_types.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Public active price conditions" ON price_rule_conditions;
CREATE POLICY "Public active price conditions"
ON price_rule_conditions FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM price_rules
    JOIN price_tables ON price_tables.id = price_rules.price_table_id
    JOIN product_types ON product_types.id = price_tables.product_type_id
    WHERE price_rules.id = price_rule_conditions.price_rule_id
      AND price_rules.status = 'active'
      AND price_tables.status = 'active'
      AND product_types.status = 'active'
      AND product_types.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Public active samples prompt" ON sample_products;
CREATE POLICY "Public active samples prompt"
ON sample_products FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM product_types
    WHERE product_types.id = sample_products.product_type_id
      AND product_types.status = 'active'
      AND product_types.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Public active sample media prompt" ON sample_product_media;
CREATE POLICY "Public active sample media prompt"
ON sample_product_media FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1
    FROM sample_products
    JOIN product_types ON product_types.id = sample_products.product_type_id
    WHERE sample_products.id = sample_product_media.sample_product_id
      AND sample_products.status = 'active'
      AND sample_products.deleted_at IS NULL
      AND product_types.status = 'active'
      AND product_types.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Public active content sections" ON content_sections;
CREATE POLICY "Public active content sections"
ON content_sections FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND (starts_at IS NULL OR starts_at <= NOW())
  AND (ends_at IS NULL OR ends_at >= NOW())
);

DROP POLICY IF EXISTS "Public active content media" ON content_section_media;
CREATE POLICY "Public active content media"
ON content_section_media FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1 FROM content_sections
    WHERE content_sections.id = content_section_media.content_section_id
      AND content_sections.status = 'active'
      AND (content_sections.starts_at IS NULL OR content_sections.starts_at <= NOW())
      AND (content_sections.ends_at IS NULL OR content_sections.ends_at >= NOW())
  )
);

DROP POLICY IF EXISTS "Public read public site settings" ON site_settings;
CREATE POLICY "Public read public site settings"
ON site_settings FOR SELECT
TO anon, authenticated
USING (is_public = TRUE);

-- Admin policies. Supabase-authenticated users must be listed in admin_users.
DROP POLICY IF EXISTS "Admins manage admin users" ON admin_users;
CREATE POLICY "Admins manage admin users"
ON admin_users FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage product types prompt" ON product_types;
CREATE POLICY "Admins manage product types prompt"
ON product_types FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage pricing factors" ON pricing_factors;
CREATE POLICY "Admins manage pricing factors"
ON pricing_factors FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage product type factors" ON product_type_factors;
CREATE POLICY "Admins manage product type factors"
ON product_type_factors FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage factor values" ON product_type_factor_values;
CREATE POLICY "Admins manage factor values"
ON product_type_factor_values FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage price tables" ON price_tables;
CREATE POLICY "Admins manage price tables"
ON price_tables FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage price rules" ON price_rules;
CREATE POLICY "Admins manage price rules"
ON price_rules FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage price conditions" ON price_rule_conditions;
CREATE POLICY "Admins manage price conditions"
ON price_rule_conditions FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage samples prompt" ON sample_products;
CREATE POLICY "Admins manage samples prompt"
ON sample_products FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage sample media prompt" ON sample_product_media;
CREATE POLICY "Admins manage sample media prompt"
ON sample_product_media FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage content sections" ON content_sections;
CREATE POLICY "Admins manage content sections"
ON content_sections FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage content media" ON content_section_media;
CREATE POLICY "Admins manage content media"
ON content_section_media FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage site settings" ON site_settings;
CREATE POLICY "Admins manage site settings"
ON site_settings FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public can create contact messages" ON contact_messages;
CREATE POLICY "Public can create contact messages"
ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "Admins manage contact messages" ON contact_messages;
CREATE POLICY "Admins manage contact messages"
ON contact_messages FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
CREATE POLICY "Admins read audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Admins write audit logs" ON audit_logs;
CREATE POLICY "Admins write audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- ---------- Storage buckets ----------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-samples', 'product-samples', TRUE),
  ('content-media', 'content-media', TRUE),
  ('price-table-assets', 'price-table-assets', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product sample media" ON storage.objects;
CREATE POLICY "Public read product sample media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('product-samples', 'content-media'));

DROP POLICY IF EXISTS "Admins manage storage media" ON storage.objects;
CREATE POLICY "Admins manage storage media"
ON storage.objects FOR ALL
TO authenticated
USING (is_admin() AND bucket_id IN ('product-samples', 'content-media', 'price-table-assets'))
WITH CHECK (is_admin() AND bucket_id IN ('product-samples', 'content-media', 'price-table-assets'));
