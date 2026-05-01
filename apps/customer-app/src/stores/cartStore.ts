import { create } from 'zustand';
import type { Product } from 'shared-types';
import { storage } from '../services/storage';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    hydrated: boolean;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getSubtotal: () => number;
    getTotal: () => number;
    hydrate: () => Promise<void>;
}

const CART_STORAGE_KEY = 'korde_cart';

async function loadCart(): Promise<CartItem[]> {
    try {
        const data = await storage.getItem(CART_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

async function saveCart(items: CartItem[]) {
    try {
        await storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.warn('Failed to save cart:', e);
    }
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    hydrated: false,

    hydrate: async () => {
        const items = await loadCart();
        set({ items, hydrated: true });
    },

    addItem: (product: Product, quantity: number = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((item) => item.product.id === product.id);

        let newItems: CartItem[];
        if (existingIndex >= 0) {
            newItems = items.map((item, index) =>
                index === existingIndex
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            newItems = [...items, { product, quantity }];
        }

        saveCart(newItems);
        set({ items: newItems });
    },

    removeItem: (productId: string) => {
        const newItems = get().items.filter((item) => item.product.id !== productId);
        saveCart(newItems);
        set({ items: newItems });
    },

    updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }

        const newItems = get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
        );
        saveCart(newItems);
        set({ items: newItems });
    },

    clearCart: () => {
        saveCart([]);
        set({ items: [] });
    },

    getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
    },

    getSubtotal: () => {
        return get().items.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
        );
    },

    getTotal: () => {
        return get().getSubtotal();
    },
}));
