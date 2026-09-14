export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BookingStatus = "new" | "contacted" | "confirmed" | "cancelled";
export type BusinessStatus = "pending" | "active" | "paused" | "rejected";
export type CommissionStatus = "pending" | "confirmed" | "invoiced" | "paid" | "cancelled";
export type LeadStatus = "new" | "consulting" | "converted" | "expired" | "cancelled";
export type ProductOrderStatus = "new" | "contacted" | "confirmed" | "cancelled";
export type UserRole = "customer" | "business" | "admin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      tour_bookings: {
        Row: {
          id: string;
          package_id: string;
          provider_id: string;
          customer_name: string;
          phone: string;
          email: string | null;
          start_date: string | null;
          end_date: string | null;
          guests: number;
          note: string | null;
          estimated_price: number | null;
          status: BookingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tour_bookings"]["Row"], "id" | "status" | "created_at" | "updated_at"> & {
          id?: string;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tour_bookings"]["Insert"]>;
      };
      self_guided_bookings: {
        Row: {
          id: string;
          homestay_id: string;
          customer_name: string;
          phone: string;
          email: string | null;
          checkin: string;
          checkout: string;
          guests: number;
          experience_ids: string[];
          note: string | null;
          estimated_price: number;
          status: BookingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["self_guided_bookings"]["Row"], "id" | "status" | "created_at" | "updated_at"> & {
          id?: string;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["self_guided_bookings"]["Insert"]>;
      };
      product_orders: {
        Row: {
          id: string;
          product_slug: string;
          product_name: string;
          customer_name: string;
          phone: string;
          email: string | null;
          quantity: number;
          address: string | null;
          note: string | null;
          status: ProductOrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_orders"]["Row"], "id" | "status" | "created_at" | "updated_at"> & {
          id?: string;
          status?: ProductOrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_orders"]["Insert"]>;
      };
      chat_messages: {
        Row: {
          id: string;
          customer_name: string | null;
          email: string | null;
          phone: string | null;
          message: string;
          reply: string | null;
          is_resolved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_messages"]["Row"], "id" | "reply" | "is_resolved" | "created_at" | "updated_at"> & {
          id?: string;
          reply?: string | null;
          is_resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          owner_name: string | null;
          phone: string | null;
          email: string | null;
          zalo_url: string | null;
          address: string | null;
          default_commission_rate: number;
          status: BusinessStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["businesses"]["Row"], "id" | "status" | "created_at" | "updated_at"> & {
          id?: string;
          status?: BusinessStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Insert"]>;
      };
      places: {
        Row: {
          id: string;
          business_id: string | null;
          slug: string;
          name: string;
          category: string;
          summary: string;
          description: string | null;
          address: string | null;
          map_embed_url: string | null;
          price_label: string | null;
          voucher_offer: string | null;
          commission_rate: number;
          image_url: string | null;
          gallery_urls: string[];
          services: string[];
          highlights: string[];
          is_featured: boolean;
          status: BusinessStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["places"]["Row"], "id" | "status" | "created_at" | "updated_at"> & {
          id?: string;
          status?: BusinessStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["places"]["Insert"]>;
      };
      place_leads: {
        Row: {
          id: string;
          lead_code: string;
          voucher_code: string;
          place_id: string | null;
          place_name: string;
          customer_name: string;
          phone: string;
          email: string | null;
          expected_date: string | null;
          guests: number;
          need: string | null;
          status: LeadStatus;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["place_leads"]["Row"], "id" | "status" | "expires_at" | "created_at" | "updated_at"> & {
          id?: string;
          status?: LeadStatus;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["place_leads"]["Insert"]>;
      };
      place_transactions: {
        Row: {
          id: string;
          lead_id: string;
          business_id: string | null;
          place_id: string | null;
          order_value: number;
          commission_rate: number;
          commission_amount: number;
          status: CommissionStatus;
          confirmed_at: string | null;
          paid_at: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["place_transactions"]["Row"], "id" | "status" | "created_at" | "updated_at"> & {
          id?: string;
          status?: CommissionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["place_transactions"]["Insert"]>;
      };
    };
  };
};
