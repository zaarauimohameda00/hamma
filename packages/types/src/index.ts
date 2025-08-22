export type UUID = string;

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  parent_id: UUID | null;
  created_at?: string;
}

export interface Product {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category_id: UUID;
  is_active: boolean;
  featured: boolean;
  stock_quantity: number;
  created_at?: string;
}

export interface ProductVariant {
  id: UUID;
  product_id: UUID;
  name: string;
  value: string;
  stock_quantity: number;
  price_delta: number;
}

export interface CartItem {
  id: UUID;
  user_id: UUID | null;
  guest_token: string | null;
  product_id: UUID;
  variant_id: UUID | null;
  quantity: number;
}

export interface Order {
  id: UUID;
  user_id: UUID;
  full_name: string;
  country: string;
  city: string;
  email: string;
  zip_code: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  created_at?: string;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  quantity: number;
  unit_price: number;
}