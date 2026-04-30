import { Profile } from './user';
import { Product } from './product';

export type OrderStatus = 'placed' | 'confirmed' | 'picking' | 'ready' | 'handed_over' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    subtotal: number;
    discount: number;
    total: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_id: string | null;
    payment_method: string | null;
    customer_outside: boolean;
    created_at: string;
    updated_at: string;
    ready_at: string | null;
    picked_up_at: string | null;
    customer?: Profile;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: Product;
}

export interface OrderInsert {
    customer_id: string;
    order_number?: string;
    subtotal: number;
    discount?: number;
    total: number;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    payment_id?: string | null;
    payment_method?: string | null;
    customer_outside?: boolean;
}
