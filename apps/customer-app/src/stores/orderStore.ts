import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Order, OrderItem, OrderStatus } from 'shared-types';

interface OrderState {
    currentOrder: Order | null;
    orders: Order[];
    loading: boolean;

    fetchOrders: () => Promise<void>;
    fetchOrderById: (orderId: string) => Promise<Order | null>;
    createOrder: (params: {
        customerOutside: boolean;
        items: { productId: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }[];
        subtotal: number;
        discount: number;
        total: number;
    }) => Promise<{ order: Order | null; error: string | null }>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    setCustomerOutside: (orderId: string, outside: boolean) => Promise<void>;
    subscribeToOrder: (orderId: string) => () => void;
    setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    currentOrder: null,
    orders: [],
    loading: false,

    fetchOrders: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
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

    fetchOrderById: async (orderId: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', orderId)
                .single();

            if (error) return null;
            return data as Order;
        } catch {
            return null;
        }
    },

    createOrder: async (params) => {
        set({ loading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { order: null, error: 'Not authenticated' };

            // Generate order number
            const { data: orderNumData } = await supabase.rpc('generate_order_number');
            const orderNumber = orderNumData || `KGS-${Date.now().toString().slice(-6)}`;

            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_id: user.id,
                    order_number: orderNumber,
                    subtotal: params.subtotal,
                    discount: params.discount,
                    total: params.total,
                    status: 'placed',
                    payment_status: 'pending',
                    customer_outside: params.customerOutside,
                })
                .select()
                .single();

            if (orderError || !order) {
                return { order: null, error: orderError?.message || 'Failed to create order' };
            }

            // Create order items
            const orderItems = params.items.map((item) => ({
                order_id: order.id,
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.totalPrice,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                // Rollback order
                await supabase.from('orders').delete().eq('id', order.id);
                return { order: null, error: 'Failed to create order items' };
            }

            // Fetch complete order with items
            const completeOrder = await get().fetchOrderById(order.id);
            set({ currentOrder: completeOrder });

            return { order: completeOrder, error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create order';
            return { order: null, error: message };
        } finally {
            set({ loading: false });
        }
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus) => {
        const updates: Record<string, unknown> = { status };
        if (status === 'ready') updates.ready_at = new Date().toISOString();
        if (status === 'handed_over') updates.picked_up_at = new Date().toISOString();

        await supabase.from('orders').update(updates).eq('id', orderId);
    },

    setCustomerOutside: async (orderId: string, outside: boolean) => {
        await supabase
            .from('orders')
            .update({ customer_outside: outside })
            .eq('id', orderId);

        const { currentOrder } = get();
        if (currentOrder?.id === orderId) {
            set({ currentOrder: { ...currentOrder, customer_outside: outside } });
        }
    },

    subscribeToOrder: (orderId: string) => {
        const channel = supabase
            .channel(`order:${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    const { currentOrder } = get();
                    if (currentOrder) {
                        set({ currentOrder: { ...currentOrder, ...payload.new } });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    setCurrentOrder: (order) => set({ currentOrder: order }),
}));
