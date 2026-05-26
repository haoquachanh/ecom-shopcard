-- ======================================================
-- ECOM SHOPCARD MOCK ADMIN USER
-- Run after supabase/migrations/001_prompt_architecture_schema.sql.
--
-- Dev/staging credentials:
--   email:    admin@shopcard.local
--   password: Admin123456
--
-- Do not run this file on production.
-- ======================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  mock_admin_id UUID;
  fallback_admin_id UUID := '00000000-0000-4000-8000-000000000001';
  mock_admin_email TEXT := 'admin@shopcard.local';
  mock_admin_password TEXT := 'Admin123456';
  mock_admin_name TEXT := 'Mock Admin';
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RAISE EXCEPTION 'auth.users table not found. Run this in a Supabase project database.';
  END IF;

  SELECT id
  INTO mock_admin_id
  FROM auth.users
  WHERE email = mock_admin_email
  LIMIT 1;

  mock_admin_id := COALESCE(mock_admin_id, fallback_admin_id);

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    mock_admin_id,
    'authenticated',
    'authenticated',
    mock_admin_email,
    crypt(mock_admin_password, gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('display_name', mock_admin_name),
    FALSE,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password,
      email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at),
      raw_app_meta_data = EXCLUDED.raw_app_meta_data,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data,
      updated_at = NOW();

  IF to_regclass('auth.identities') IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      mock_admin_id,
      mock_admin_id::text,
      jsonb_build_object(
        'sub', mock_admin_id::text,
        'email', mock_admin_email,
        'email_verified', TRUE,
        'phone_verified', FALSE
      ),
      'email',
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (provider_id, provider) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        identity_data = EXCLUDED.identity_data,
        updated_at = NOW();
  END IF;

  INSERT INTO public.admin_users (
    user_id,
    email,
    display_name,
    is_active
  )
  VALUES (
    mock_admin_id,
    mock_admin_email,
    mock_admin_name,
    TRUE
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      is_active = TRUE,
      updated_at = NOW();
END;
$$;

COMMIT;

SELECT
  admin_users.user_id,
  admin_users.email,
  admin_users.display_name,
  admin_users.is_active
FROM public.admin_users
WHERE email = 'admin@shopcard.local';
