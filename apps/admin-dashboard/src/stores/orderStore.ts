import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Order, OrderStatus } from 'shared-types';

interface OrderState {
    orders: Order[];
    loading: boolean;
    fetchOrders: () => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    subscribeToOrders: () => () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    loading: false,

    fetchOrders: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*), customer:profiles(*)')
                .order('created_at', { ascending: false });

            if (!error && data) {
                set({ orders: data as Order[] });
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            set({ loading: false });
        }
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus) => {
        const updates: Record<string, unknown> = { status };
        if (status === 'ready') updates.ready_at = new Date().toISOString();
        if (status === 'handed_over') updates.picked_up_at = new Date().toISOString();

        await supabase.from('orders').update(updates).eq('id', orderId);

        // Optimistic update
        set({
            orders: get().orders.map((o) =>
                o.id === orderId ? { ...o, ...updates, status } : o
            ),
        });
    },

    subscribeToOrders: () => {
        const channel = supabase
            .channel('admin-orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    get().fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
