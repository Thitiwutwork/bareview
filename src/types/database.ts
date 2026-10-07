export type UserRole = 'customer' | 'admin';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ReviewStatus = 'published' | 'hidden' | 'pending';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  average_rating?: number;
  review_count?: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name?: string | null;
  notes?: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  completed_at: string | null;
  order_items?: OrderItem[];
  profiles?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products?: Product;
  has_reviewed?: boolean;
}

export interface Review {
  id: string;
  user_id: string | null;
  customer_name?: string | null;
  product_id: string;
  order_id: string;
  rating: number;
  comment: string;
  image_url: string | null;
  is_verified: boolean;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  products?: Product;
  orders?: Order;
  replies?: ReviewReply[];
}

export interface ReviewToken {
  id: string;
  order_id: string;
  user_id: string | null;
  customer_name?: string | null;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
  orders?: Order;
}

export interface ReviewReport {
  id: string;
  review_id: string;
  user_id: string;
  reason: 'Spam' | 'Offensive' | 'Advertisement' | 'Fake Review' | 'Inappropriate Content' | 'Other';
  detail: string | null;
  status: ReportStatus;
  created_at: string;
  reviews?: Review;
  profiles?: Profile;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  admin_id: string;
  reply: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  description: string;
  ip_address: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface VerifiedReviewEligibility {
  eligible: boolean;
  order_id?: string;
  message?: string;
}
