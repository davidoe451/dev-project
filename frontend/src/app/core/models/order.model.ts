export interface OrderItemProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price?: string | number;
  stock?: number;
  brand?: string;
  images?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  size: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  createdAt: string;
  product?: OrderItemProduct;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: string | number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderDto {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
}

