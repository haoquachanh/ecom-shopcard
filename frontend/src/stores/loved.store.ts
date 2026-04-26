import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LovedItem {
  id: number;
  slug: string;
  name: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  description?: string;
  tags?: string[];
  productTypeId: number;
  productTypeName?: string;
}

interface LovedStore {
  items: LovedItem[];
  toggleLoved: (item: LovedItem) => void;
  removeLoved: (id: number) => void;
  clearLoved: () => void;
  isLoved: (id: number) => boolean;
}

export const useLovedStore = create<LovedStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleLoved: (item) => {
        const exists = get().items.some((current) => current.id === item.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((current) => current.id !== item.id) }));
          return;
        }
        set((state) => ({ items: [item, ...state.items] }));
      },
      removeLoved: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearLoved: () => set({ items: [] }),
      isLoved: (id) => get().items.some((item) => item.id === id),
    }),
    { name: 'shop-loved-items' },
  ),
);