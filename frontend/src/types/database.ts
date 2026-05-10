export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      product_types: {
        Row: {
          id: number;
          name: string;
          slug: string | null;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      samples: {
        Row: {
          id: number;
          product_type_id: number;
          name: string;
          slug: string | null;
          description: string | null;
          image_url: string | null;
          thumbnail_url: string | null;
          tags: string[];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      sample_images: {
        Row: {
          id: number;
          sample_id: number;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      banners: {
        Row: {
          id: number;
          title: string;
          subtitle: string | null;
          image_url: string | null;
          link_url: string | null;
          placement: string;
          is_active: boolean;
          sort_order: number;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      materials: {
        Row: {
          id: number;
          name: string;
          display_order: number;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
      };
      sizes: {
        Row: {
          id: number;
          name: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
      };
      effects: {
        Row: {
          id: number;
          name: string;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
      };
      sides: {
        Row: {
          id: number;
          name: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
      };
      base_prices: {
        Row: {
          id: number;
          product_type_id: number | null;
          material_id: number;
          size_id: number;
          side_id: number;
          effect_id: number | null;
          unit_price: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      quantity_tiers: {
        Row: {
          id: number;
          base_price_id: number;
          min_quantity: number;
          max_quantity: number | null;
          price_per_unit: string;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'user' | 'admin';
      order_status: 'pending' | 'confirmed' | 'printing' | 'shipped' | 'cancelled';
    };
    CompositeTypes: Record<string, never>;
  };
}
