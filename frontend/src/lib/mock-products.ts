import type { ProductType, Sample } from '@/types/product.types';

export const mockProductTypes: ProductType[] = [
  { id: 901, name: 'Standee mica', slug: 'standee-acrylic', description: 'Mẫu standee đế tròn', pricingConfig: {}, isActive: true },
  { id: 902, name: 'Ảnh flip', slug: 'anh-flip', description: 'Đổi hình theo góc nhìn', pricingConfig: {}, isActive: true },
  { id: 903, name: 'Ảnh depth', slug: 'anh-depth', description: 'Tạo chiều sâu nhiều lớp', pricingConfig: {}, isActive: true },
  { id: 904, name: 'Thẻ motion', slug: 'motion-card', description: 'Gợi chuyển động khi nghiêng', pricingConfig: {}, isActive: true },
];

export const mockSamples: Sample[] = Array.from({ length: 20 }, (_, index) => {
  const type = mockProductTypes[index % mockProductTypes.length];
  const palette = [
    ['fd143f', 'fff1f4'],
    ['8b5cf6', 'f5f3ff'],
    ['fb923c', 'fff7ed'],
    ['be123c', 'ffe4ec'],
  ][index % 4];

  return {
    id: 1000 + index,
    productTypeId: type.id,
    productType: type,
    name: `${type.name} mẫu ${String(index + 1).padStart(2, '0')}`,
    slug: `mock-sample-${index + 1}`,
    description: 'Mẫu demo để xem bố cục card, tag, ảnh và trạng thái yêu thích trên giao diện.',
    thumbnailUrl: `https://placehold.co/640x640/${palette[1]}/${palette[0]}?text=3D+Sample+${index + 1}`,
    imageUrl: `https://placehold.co/900x900/${palette[1]}/${palette[0]}?text=Lenti+Lab+${index + 1}`,
    tags: index % 3 === 0 ? ['Flip', 'Thương hiệu'] : index % 3 === 1 ? ['Depth', 'Quà tặng'] : ['Motion', 'POSM'],
    isActive: true,
  };
});
