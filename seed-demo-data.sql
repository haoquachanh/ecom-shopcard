-- ======================================================
-- DEMO DATA FOR ECOM SHOPCARD / LENTI LAB
-- Run after `.schema`.
-- Safe to run more than once for catalog rows using slug/name conflicts.
-- ======================================================

BEGIN;

-- ---------- Product types ----------
INSERT INTO product_types (name, slug, description, image_url, is_active, sort_order)
VALUES
  ('Standee mica', 'standee-mica', 'Mẫu standee mica để bàn, phù hợp nhân vật, mascot và quà tặng thương hiệu.', 'https://placehold.co/900x900/fff1f4/fd143f?text=Standee+Mica', TRUE, 10),
  ('Ảnh flip', 'anh-flip', 'Ảnh đổi hình khi nghiêng góc nhìn, phù hợp before/after hoặc thông điệp kép.', 'https://placehold.co/900x900/f5f3ff/8b5cf6?text=Flip+Card', TRUE, 20),
  ('Ảnh depth', 'anh-depth', 'Ảnh nổi tạo chiều sâu nhiều lớp cho chân dung, sản phẩm và artwork.', 'https://placehold.co/900x900/fff7ed/fb923c?text=Depth+3D', TRUE, 30),
  ('Thẻ motion', 'the-motion', 'Thẻ hiệu ứng chuyển động ngắn khi đổi góc nhìn.', 'https://placehold.co/900x900/fef2f2/be123c?text=Motion+Card', TRUE, 40),
  ('POSM trưng bày', 'posm-trung-bay', 'Vật phẩm trưng bày tại quầy, booth, showroom với hiệu ứng lenticular.', 'https://placehold.co/900x900/ecfeff/0891b2?text=POSM+Display', TRUE, 50)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ---------- Pricing dimensions ----------
INSERT INTO materials (name, display_order, is_active)
VALUES
  ('PET lenticular 0.45mm', 10, TRUE),
  ('PET lenticular 0.6mm', 20, TRUE),
  ('Mica acrylic 3mm', 30, TRUE)
ON CONFLICT (name) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO sizes (name, sort_order, is_active)
VALUES
  ('A6', 10, TRUE),
  ('A5', 20, TRUE),
  ('A4', 30, TRUE),
  ('10x15cm', 40, TRUE),
  ('15x20cm', 50, TRUE)
ON CONFLICT (name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO sides (name, sort_order, is_active)
VALUES
  ('1 mặt', 10, TRUE),
  ('2 mặt', 20, TRUE)
ON CONFLICT (name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO effects (name, is_active)
VALUES
  ('Flip', TRUE),
  ('Depth', TRUE),
  ('Motion', TRUE)
ON CONFLICT (name) DO UPDATE SET
  is_active = EXCLUDED.is_active;

-- ---------- Banners ----------
INSERT INTO banners (title, subtitle, image_url, link_url, placement, is_active, sort_order)
VALUES
  ('Ảnh nổi 3D Lenticular', 'Xem mẫu flip, depth, motion và gửi ý tưởng để được tư vấn.', 'https://placehold.co/1600x720/fff1f4/fd143f?text=Lenti+Lab+Hero', '/products', 'home', TRUE, 10),
  ('Mẫu quà tặng thương hiệu', 'Standee mica, thẻ motion và POSM nhỏ gọn cho chiến dịch.', 'https://placehold.co/1600x720/f5f3ff/8b5cf6?text=Brand+Gift+Samples', '/products', 'home', TRUE, 20)
ON CONFLICT DO NOTHING;

-- ---------- 20 samples ----------
WITH rows(product_slug, name, slug, description, image_url, thumbnail_url, tags, sort_order) AS (
  VALUES
    ('standee-mica', 'Standee nhân vật anime mini', 'standee-nhan-vat-anime-mini', 'Standee mica nhỏ để bàn, phù hợp nhân vật sưu tầm và quà tặng fandom.', 'https://placehold.co/900x900/fff1f4/fd143f?text=Anime+Standee', 'https://placehold.co/480x480/fff1f4/fd143f?text=Anime', ARRAY['Standee','Mica','Quà tặng'], 10),
    ('standee-mica', 'Standee mascot thương hiệu', 'standee-mascot-thuong-hieu', 'Mẫu mascot nổi bật cho quầy bán hàng, booth sự kiện hoặc giftset.', 'https://placehold.co/900x900/fef2f2/be123c?text=Mascot+Standee', 'https://placehold.co/480x480/fef2f2/be123c?text=Mascot', ARRAY['Mascot','Branding'], 20),
    ('standee-mica', 'Standee couple kỷ niệm', 'standee-couple-ky-niem', 'Mẫu standee ảnh đôi, làm quà kỷ niệm hoặc decor bàn làm việc.', 'https://placehold.co/900x900/fdf2f8/db2777?text=Couple+Standee', 'https://placehold.co/480x480/fdf2f8/db2777?text=Couple', ARRAY['Couple','Gift'], 30),
    ('standee-mica', 'Standee sản phẩm launch', 'standee-san-pham-launch', 'Standee sản phẩm dùng cho launch kit, preview sản phẩm mới và trưng bày.', 'https://placehold.co/900x900/ecfeff/0891b2?text=Product+Launch', 'https://placehold.co/480x480/ecfeff/0891b2?text=Launch', ARRAY['POSM','Launch'], 40),

    ('anh-flip', 'Ảnh flip before after', 'anh-flip-before-after', 'Hiệu ứng đổi ảnh trước và sau khi nghiêng, phù hợp chiến dịch chuyển đổi.', 'https://placehold.co/900x900/f5f3ff/8b5cf6?text=Before+After', 'https://placehold.co/480x480/f5f3ff/8b5cf6?text=Before', ARRAY['Flip','Before After'], 50),
    ('anh-flip', 'Ảnh flip thông điệp kép', 'anh-flip-thong-diep-kep', 'Một mẫu ảnh thể hiện hai thông điệp khác nhau trên cùng bề mặt.', 'https://placehold.co/900x900/ede9fe/7c3aed?text=Dual+Message', 'https://placehold.co/480x480/ede9fe/7c3aed?text=Dual', ARRAY['Flip','Message'], 60),
    ('anh-flip', 'Ảnh flip chân dung', 'anh-flip-chan-dung', 'Chân dung đổi biểu cảm khi thay đổi góc nhìn.', 'https://placehold.co/900x900/fae8ff/a21caf?text=Portrait+Flip', 'https://placehold.co/480x480/fae8ff/a21caf?text=Portrait', ARRAY['Flip','Portrait'], 70),
    ('anh-flip', 'Ảnh flip logo brand', 'anh-flip-logo-brand', 'Logo chuyển trạng thái hoặc đổi màu theo góc nhìn cho brand activation.', 'https://placehold.co/900x900/e0f2fe/0284c7?text=Logo+Flip', 'https://placehold.co/480x480/e0f2fe/0284c7?text=Logo', ARRAY['Flip','Branding'], 80),

    ('anh-depth', 'Ảnh depth phong cảnh', 'anh-depth-phong-canh', 'Tách lớp nền, trung cảnh và tiền cảnh để tạo chiều sâu rõ.', 'https://placehold.co/900x900/fff7ed/fb923c?text=Landscape+Depth', 'https://placehold.co/480x480/fff7ed/fb923c?text=Landscape', ARRAY['Depth','Landscape'], 90),
    ('anh-depth', 'Ảnh depth chân dung nghệ thuật', 'anh-depth-chan-dung-nghe-thuat', 'Mẫu chân dung nhiều lớp, tạo cảm giác nổi khỏi mặt ảnh.', 'https://placehold.co/900x900/ffedd5/ea580c?text=Art+Portrait', 'https://placehold.co/480x480/ffedd5/ea580c?text=Art', ARRAY['Depth','Portrait'], 100),
    ('anh-depth', 'Ảnh depth sản phẩm cao cấp', 'anh-depth-san-pham-cao-cap', 'Tạo chiều sâu cho key visual sản phẩm, phù hợp kệ trưng bày.', 'https://placehold.co/900x900/fef3c7/d97706?text=Premium+Product', 'https://placehold.co/480x480/fef3c7/d97706?text=Product', ARRAY['Depth','Product'], 110),
    ('anh-depth', 'Ảnh depth artwork game', 'anh-depth-artwork-game', 'Artwork nhân vật/game được tách lớp để tăng cảm giác 3D.', 'https://placehold.co/900x900/e0e7ff/4f46e5?text=Game+Artwork', 'https://placehold.co/480x480/e0e7ff/4f46e5?text=Game', ARRAY['Depth','Artwork'], 120),

    ('the-motion', 'Thẻ motion chạy động tác', 'the-motion-chay-dong-tac', 'Hiệu ứng mô phỏng chuyển động ngắn khi nghiêng thẻ.', 'https://placehold.co/900x900/fef2f2/dc2626?text=Action+Motion', 'https://placehold.co/480x480/fef2f2/dc2626?text=Action', ARRAY['Motion','Card'], 130),
    ('the-motion', 'Thẻ motion nhân vật thể thao', 'the-motion-nhan-vat-the-thao', 'Mẫu thể thao tạo cảm giác vận động liên tục.', 'https://placehold.co/900x900/ecfdf5/059669?text=Sport+Motion', 'https://placehold.co/480x480/ecfdf5/059669?text=Sport', ARRAY['Motion','Sport'], 140),
    ('the-motion', 'Thẻ motion sản phẩm xoay', 'the-motion-san-pham-xoay', 'Sản phẩm đổi góc/ánh sáng khi nghiêng, phù hợp catalog premium.', 'https://placehold.co/900x900/f0f9ff/0369a1?text=Product+Motion', 'https://placehold.co/480x480/f0f9ff/0369a1?text=Motion', ARRAY['Motion','Product'], 150),
    ('the-motion', 'Thẻ motion sparkle', 'the-motion-sparkle', 'Hiệu ứng ánh sáng lấp lánh cho card quà tặng hoặc collectible.', 'https://placehold.co/900x900/fdf4ff/c026d3?text=Sparkle+Motion', 'https://placehold.co/480x480/fdf4ff/c026d3?text=Sparkle', ARRAY['Motion','Sparkle'], 160),

    ('posm-trung-bay', 'POSM quầy mỹ phẩm', 'posm-quay-my-pham', 'Mẫu trưng bày nhỏ cho quầy mỹ phẩm, làm nổi bật key visual.', 'https://placehold.co/900x900/fce7f3/be185d?text=Cosmetic+POSM', 'https://placehold.co/480x480/fce7f3/be185d?text=Cosmetic', ARRAY['POSM','Retail'], 170),
    ('posm-trung-bay', 'POSM booth sự kiện', 'posm-booth-su-kien', 'Vật phẩm nổi bật cho booth, activation và khu vực check-in.', 'https://placehold.co/900x900/ecfeff/0e7490?text=Event+Booth', 'https://placehold.co/480x480/ecfeff/0e7490?text=Booth', ARRAY['POSM','Event'], 180),
    ('posm-trung-bay', 'POSM menu đồ uống', 'posm-menu-do-uong', 'Menu nhỏ có hiệu ứng chuyển ảnh, phù hợp cafe, trà sữa, F&B.', 'https://placehold.co/900x900/fef9c3/ca8a04?text=Drink+Menu', 'https://placehold.co/480x480/fef9c3/ca8a04?text=Menu', ARRAY['POSM','F&B'], 190),
    ('posm-trung-bay', 'POSM launch campaign', 'posm-launch-campaign', 'Ấn phẩm trưng bày cho chiến dịch ra mắt sản phẩm hoặc bộ sưu tập.', 'https://placehold.co/900x900/fee2e2/e11d48?text=Campaign+POSM', 'https://placehold.co/480x480/fee2e2/e11d48?text=Campaign', ARRAY['POSM','Campaign'], 200)
)
INSERT INTO samples (product_type_id, name, slug, description, image_url, thumbnail_url, tags, is_active, sort_order)
SELECT
  product_types.id,
  rows.name,
  rows.slug,
  rows.description,
  rows.image_url,
  rows.thumbnail_url,
  rows.tags,
  TRUE,
  rows.sort_order
FROM rows
JOIN product_types ON product_types.slug = rows.product_slug
ON CONFLICT (slug) DO UPDATE SET
  product_type_id = EXCLUDED.product_type_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  tags = EXCLUDED.tags,
  is_active = TRUE,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Add one extra gallery image per sample.
INSERT INTO sample_images (sample_id, image_url, alt_text, sort_order, is_active)
SELECT
  samples.id,
  replace(samples.image_url, '900x900', '1200x900'),
  samples.name || ' gallery',
  10,
  TRUE
FROM samples
WHERE samples.slug IN (
  'standee-nhan-vat-anime-mini',
  'standee-mascot-thuong-hieu',
  'standee-couple-ky-niem',
  'standee-san-pham-launch',
  'anh-flip-before-after',
  'anh-flip-thong-diep-kep',
  'anh-flip-chan-dung',
  'anh-flip-logo-brand',
  'anh-depth-phong-canh',
  'anh-depth-chan-dung-nghe-thuat',
  'anh-depth-san-pham-cao-cap',
  'anh-depth-artwork-game',
  'the-motion-chay-dong-tac',
  'the-motion-nhan-vat-the-thao',
  'the-motion-san-pham-xoay',
  'the-motion-sparkle',
  'posm-quay-my-pham',
  'posm-booth-su-kien',
  'posm-menu-do-uong',
  'posm-launch-campaign'
)
AND NOT EXISTS (
  SELECT 1
  FROM sample_images
  WHERE sample_images.sample_id = samples.id
    AND sample_images.sort_order = 10
);

-- ---------- Demo base prices ----------
WITH combos AS (
  SELECT
    product_types.id AS product_type_id,
    materials.id AS material_id,
    sizes.id AS size_id,
    sides.id AS side_id,
    effects.id AS effect_id,
    CASE
      WHEN sizes.name = 'A6' THEN 120000
      WHEN sizes.name = '10x15cm' THEN 135000
      WHEN sizes.name = 'A5' THEN 180000
      WHEN sizes.name = '15x20cm' THEN 220000
      ELSE 320000
    END
    + CASE WHEN materials.name = 'Mica acrylic 3mm' THEN 60000 ELSE 0 END
    + CASE WHEN sides.name = '2 mặt' THEN 50000 ELSE 0 END
    + CASE WHEN effects.name = 'Depth' THEN 40000 WHEN effects.name = 'Motion' THEN 50000 ELSE 30000 END
    AS unit_price
  FROM product_types
  CROSS JOIN materials
  CROSS JOIN sizes
  CROSS JOIN sides
  LEFT JOIN effects ON effects.name IN ('Flip', 'Depth', 'Motion')
  WHERE product_types.slug IN ('standee-mica', 'anh-flip', 'anh-depth', 'the-motion', 'posm-trung-bay')
    AND materials.name IN ('PET lenticular 0.6mm', 'Mica acrylic 3mm')
    AND sizes.name IN ('A6', 'A5', 'A4', '10x15cm')
    AND sides.name IN ('1 mặt', '2 mặt')
    AND (
      (product_types.slug = 'anh-flip' AND effects.name = 'Flip')
      OR (product_types.slug = 'anh-depth' AND effects.name = 'Depth')
      OR (product_types.slug = 'the-motion' AND effects.name = 'Motion')
      OR (product_types.slug IN ('standee-mica', 'posm-trung-bay') AND effects.name IN ('Depth', 'Motion'))
    )
)
INSERT INTO base_prices (product_type_id, material_id, size_id, side_id, effect_id, unit_price, is_active)
SELECT product_type_id, material_id, size_id, side_id, effect_id, unit_price, TRUE
FROM combos
ON CONFLICT (
  COALESCE(product_type_id, 0),
  material_id,
  size_id,
  side_id,
  COALESCE(effect_id, 0)
) DO UPDATE SET
  unit_price = EXCLUDED.unit_price,
  is_active = TRUE,
  updated_at = NOW();

-- Quantity tiers: 20+, 50+, 100+ discount.
INSERT INTO quantity_tiers (base_price_id, min_quantity, max_quantity, price_per_unit, is_active)
SELECT id, 20, 49, ROUND(unit_price * 0.92), TRUE
FROM base_prices
WHERE NOT EXISTS (
  SELECT 1 FROM quantity_tiers WHERE quantity_tiers.base_price_id = base_prices.id AND min_quantity = 20
);

INSERT INTO quantity_tiers (base_price_id, min_quantity, max_quantity, price_per_unit, is_active)
SELECT id, 50, 99, ROUND(unit_price * 0.85), TRUE
FROM base_prices
WHERE NOT EXISTS (
  SELECT 1 FROM quantity_tiers WHERE quantity_tiers.base_price_id = base_prices.id AND min_quantity = 50
);

INSERT INTO quantity_tiers (base_price_id, min_quantity, max_quantity, price_per_unit, is_active)
SELECT id, 100, NULL, ROUND(unit_price * 0.78), TRUE
FROM base_prices
WHERE NOT EXISTS (
  SELECT 1 FROM quantity_tiers WHERE quantity_tiers.base_price_id = base_prices.id AND min_quantity = 100
);

COMMIT;
