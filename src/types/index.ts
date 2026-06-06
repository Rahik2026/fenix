export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  enabled: boolean;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  description: string;
  details: string;
  specifications: string[];
  sizeOptions: string[];
  stock: number;
  sku: string;
  originalPrice: number;
  offerPrice: number;
  mainImage: string;
  detailImages: string[];
  featured: boolean;
  newArrival: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  enabled: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type OrderStatus =
  | "Awaiting Payment"
  | "Payment Submitted"
  | "Verified"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "Awaiting Payment",
  "Payment Submitted",
  "Verified",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export interface PaymentInfo {
  transactionId: string;
  senderNumber: string;
  amount: number;
  submittedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  image?: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  createdAt: string;
  userId?: string | null;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  division: string;
  district: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountTotal: number;
  total: number;
  couponCode: string;
  status: OrderStatus;
  payment?: PaymentInfo | null;
  adminNotes: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  transactionId: string;
  senderNumber: string;
  amount: number;
  method: string;
  verified: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  wishlist: string[];
  createdAt: string;
}

export interface HeroBanner {
  eyebrow: string;
  title: string;
  copy: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  secondaryLink: string;
  image: string;
  productImage: string;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsapp: string;
  currency: string;
  lowStockThreshold: number;
  shippingDhaka: number;
  shippingOther: number;
  bkashNumber: string;
  paymentInstructions: string;
  footerNote: string;
  announcement: string;
  // CMS text
  featuredKicker: string;
  featuredTitle: string;
  featuredCopy: string;
  categoriesKicker: string;
  categoriesTitle: string;
  categoriesCopy: string;
  newsletterTitle: string;
  newsletterCopy: string;
  aboutTitle: string;
  aboutBody: string;
  contactTitle: string;
  contactBody: string;
  policiesTitle: string;
  policiesBody: string;
  heroBanner: HeroBanner;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
  stock: number;
}
