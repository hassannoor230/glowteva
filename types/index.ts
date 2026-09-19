export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  options: Record<string, string>;
  price?: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: string;
  image?: string;
  images: string[];
  barcode?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  productType: string;
  skinConcerns: string[];
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  images: string[];
  thumbnail: string;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  tags?: string[];
  options: ProductOption[];
  variants: ProductVariant[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  addresses?: Address[];
  wishlist?: Product[];
  createdAt?: string;
}

export interface Address {
  _id?: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  selectedOptions?: Record<string, string>;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: {
    product: string;
    variantId?: string;
    selectedOptions?: Record<string, string>;
    name: string;
    slug: string;
    thumbnail: string;
    price: number;
    sku: string;
    quantity: number;
    subtotal?: number;
  }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  title: string;
  text: string;
  verifiedPurchase: boolean;
  user: { name: string };
  createdAt: string;
}

export interface JournalArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  featured: boolean;
  readingTime: number;
  publishedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}
