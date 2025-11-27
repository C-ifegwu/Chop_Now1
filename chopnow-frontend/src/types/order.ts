import { OrderItem } from "./order-item";

export interface Order {
  id: number;
  consumer_id: number;
  vendor_id: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  vendor_name: string;
  consumer_name?: string; // Make it optional
  items: OrderItem[];
}
