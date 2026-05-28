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
          status: 'draft' | 'active' | 'inactive' | 'archived';
          sort_order: number;
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      sample_products: {
        Row: {
          id: number;
          product_type_id: number;
          name: string;
          slug: string | null;
          description: string | null;
          status: 'draft' | 'active' | 'inactive' | 'archived';
          sort_order: number;
          tags: string[];
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      sample_product_media: {
        Row: {
          id: number;
          sample_product_id: number;
          media_type: 'image' | 'video';
          bucket: string;
          storage_path: string;
          public_url: string | null;
          alt_text: string | null;
          is_primary: boolean;
          status: 'draft' | 'active' | 'inactive' | 'archived';
          sort_order: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: {
      public_active_product_types: {
        Row: {
          id: number;
          name: string;
          slug: string | null;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      get_homepage_data: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_active_price_table: {
        Args: {
          product_type_slug: string;
        };
        Returns: Json;
      };
      get_product_type_detail: {
        Args: {
          product_type_slug: string;
        };
        Returns: Json;
      };
      track_page_view: {
        Args: {
          p_visitor_id: string;
          p_session_id: string;
          p_path: string;
          p_referrer_host?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      public_record_status: 'draft' | 'active' | 'inactive' | 'archived';
      media_type: 'image' | 'video';
    };
    CompositeTypes: Record<string, never>;
  };
}
