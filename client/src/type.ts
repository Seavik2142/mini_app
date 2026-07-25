export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  tonPrice?: number;
  starsPrice?: number;
  images: string[];
  categoryId: number;
  categoryName?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
  isDigital?: boolean;
  warranty?: string;
  keyFormat?: string;
  activationInstructions?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DigitalKeyItem {
  key: string;
  status: 'UNUSED' | 'REDEEMED';
  deliveredAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  digitalKeys?: string[];
  activationInstructions?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  paymentMethod: 'USD' | 'KHR' | 'TON' | 'STARS' | 'CARD' | string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'DELIVERED' | 'PROCESSING' | 'CANCELLED';
  shippingAddress?: string;
  contactPhone?: string;
  createdAt: string;
  items: OrderItem[];
}