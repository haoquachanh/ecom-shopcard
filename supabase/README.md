# Supabase Schema

The prompt-aligned schema lives in:

```txt
supabase/migrations/001_prompt_architecture_schema.sql
```

It defines the admin/public data model from the latest prompt. The root `.schema` file is the standalone schema version; the migration file is the Supabase migration entrypoint.

## Core Model

- `product_types`
- `pricing_factors`
- `product_type_factors`
- `product_type_factor_values`
- `price_tables`
- `price_rules`
- `price_rule_conditions`
- `sample_products`
- `sample_product_media`
- `content_sections`
- `content_section_media`
- `site_settings`
- `contact_messages`
- `audit_logs`
- `analytics_page_views`

## Runtime Shape

```txt
Public frontend
-> read active product/sample/pricing/content rows through Supabase anon key

Admin Electron
-> preload IPC
-> main process services
-> repositories
-> Supabase/Postgres/Storage
```

## Implementation Notes

Frontend public reads only active rows through Supabase policies and these RPCs:

- `get_homepage_data()`
- `get_product_type_detail(product_type_slug)`
- `get_active_price_table(product_type_slug)`
- `track_page_view(visitor_id, session_id, path, referrer_host)`

Admin Electron should write through IPC services and use the dynamic pricing model: `pricing_factors`, `product_type_factor_values`, `price_tables`, `price_rules`, and `price_rule_conditions`. Prices are stored as integer VND in `price_rules.price_vnd`.

Admin analytics reads use:

- `get_analytics_overview(start_date, end_date)`

Only authenticated users present in `admin_users` can execute analytics reports. Public customers can execute `track_page_view` but cannot select, update, or delete analytics rows. Admin UI reads aggregate JSON through RPC instead of selecting raw visitor/session rows.

## Preflight Test

After applying the migration to a Supabase project, run:

```txt
supabase/tests/schema_preflight.sql
```

The test script wraps all test data in a transaction and rolls it back.

## Development Seeds

Run these only on local/dev/staging databases after the migration:

```txt
supabase/seeds/mock_admin.sql
supabase/seeds/mock_data.sql
```

`mock_admin.sql` creates a confirmed Supabase Auth user and maps it to `public.admin_users`:

```txt
email: admin@shopcard.local
password: Admin123456
```
