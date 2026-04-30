import { create } from 'zustand';
import { Platform } from 'react-native';
import type { Product } from 'shared-types';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getSubtotal: () => number;
    getDiscount: () => number;
    getTotal: () => number;
}

const CART_STORAGE_KEY = 'korde_cart';

// Platform-aware storage: localStorage on web, MMKV on native
let storage: {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
};

if (Platform.OS === 'web') {
    storage = {
        getString: (key: string) => localStorage.getItem(key) ?? undefined,
        set: (key: string, value: string) => localStorage.setItem(key, value),
        delete: (key: string) => localStorage.removeItem(key),
    };
} else {
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV();
    storage = {
        getString: (key: string) => mmkv.getString(key),
        set: (key: string, value: string) => mmkv.set(key, value),
        delete: (key: string) => mmkv.delete(key),
    };
}

function loadCart(): CartItem[] {
    try {
        const data = storage.getString(CART_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    storage.set(CART_STORAGE_KEY, JSON.stringify(items));
}

export const useCartStore = create<CartState>((set, get) => ({
    items: loadCart(),

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

    getDiscount: () => {
        return get().items.reduce(
            (total, item) => total + (item.product.mrp - item.product.price) * item.quantity,
            0
        );
    },

    getTotal: () => {
        return get().getSubtotal();
    },
}));
