export interface SizeStock {
  name: string;
  stock: number;
  visible: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabricDetails: string;
  price: number;
  salePrice?: number;
  categoryId: string;
  collectionId?: string;
  images: string[];
  video?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  sizeStock?: SizeStock[];
  featured: boolean;
  bestSeller: boolean;
  trending: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  parentId?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  startDate: number;
  endDate?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  video?: string;
  link: string;
  active: boolean;
  order: number;
  startDate?: number;
  endDate?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  couponCode?: string;
  shippingCharge: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  customerInfo: CustomerInfo;
  trackingNumber?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  area: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  altPhone?: string;
  email: string;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'received' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  startDate: number;
  endDate: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: 'customer' | 'admin';
  addresses: ShippingAddress[];
  createdAt: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  conversionRate: number;
  topProducts: { productId: string; name: string; sales: number }[];
  topCategories: { categoryId: string; name: string; sales: number }[];
  dailySales: { date: string; amount: number }[];
}
