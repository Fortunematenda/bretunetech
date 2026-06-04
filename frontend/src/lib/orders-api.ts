const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product?: {
    id: string;
    name: string;
    images: { url: string }[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

export async function getOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function getOrderById(id: string, token: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function createOrder(data: {
  addressId?: string;
  paymentMethod: string;
  notes?: string;
}, token: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}
