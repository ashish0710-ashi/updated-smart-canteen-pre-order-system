export type Category =
  | 'South Indian'
  | 'Snacks & Street Food'
  | 'Meals & Combos'
  | 'Rolls & Sandwiches'
  | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  prepTimeMinutes: number;
  stockCount: number;
  available: boolean;
  /** aggregate units sold across completed orders */
  totalSold: number;
}

export type OrderStatus =
  | 'waiting'
  | 'preparing'
  | 'ready'
  | 'completed';

export type PaymentMethod = 'UPI / QR' | 'Campus Smart Card' | 'Cash at Counter';

export interface OrderLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  prepTimeMinutes: number;
}

export interface Order {
  id: string;
  token: string;
  customerName: string;
  items: OrderLine[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  orderedAt: number;
  startedAt?: number;
  readyAt?: number;
  completedAt?: number;
  /** queue position assigned at creation, recomputed for waiting list */
  queuePosition?: number;
}

export type ViewKey = 'customer' | 'kitchen' | 'serving' | 'analytics';

export interface CartLine {
  itemId: string;
  qty: number;
}
