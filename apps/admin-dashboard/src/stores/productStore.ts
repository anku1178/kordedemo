import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Product, Category, ProductInsert, ProductUpdate } from 'shared-types';

interface ProductState {
    products: Product[];
    categories: Category[];
    loading: boolean;
    fetchProducts: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    addProduct: (product: ProductInsert) => Promise<{ error: string | null }>;
    updateProduct: (id: string, updates: ProductUpdate) => Promise<{ error: string | null }>;
    deleteProduct: (id: string) => Promise<void>;
    addCategory: (name: string) => Promise<{ error: string | null }>;
    toggleAvailability: (id: string, available: boolean) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    categories: [],
    loading: false,

    fetchProducts: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .order('name');

            if (!error && data) {
                set({ products: data as Product[] });
            }
        } catch (error) {
            console.error('Fetch products error:', error);
        } finally {
            set({ loading: false });
        }
    },

    fetchCategories: async () => {
        try {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order');

            if (data) set({ categories: data as Category[] });
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    },

    addProduct: async (product: ProductInsert) => {
        try {
            const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const { error } = await supabase
                .from('products')
                .insert({ ...product, slug });

            if (error) return { error: error.message };

            await get().fetchProducts();
            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to add product';
            return { error: message };
        }
    },

    updateProduct: async (id: string, updates: ProductUpdate) => {
        try {
            const { error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id);

            if (error) return { error: error.message };

            set({
                products: get().products.map((p) =>
                    p.id === id ? { ...p, ...updates } as Product : p
                ),
            });
            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update product';
            return { error: message };
        }
    },

    deleteProduct: async (id: string) => {
        await supabase.from('products').delete().eq('id', id);
        set({ products: get().products.filter((p) => p.id !== id) });
    },

    addCategory: async (name: string) => {
        try {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const { error } = await supabase
                .from('categories')
                .insert({ name, slug });

            if (error) return { error: error.message };

            await get().fetchCategories();
            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to add category';
            return { error: message };
        }
    },

    toggleAvailability: async (id: string, available: boolean) => {
        await supabase.from('products').update({ is_available: available }).eq('id', id);
        set({
            products: get().products.map((p) =>
                p.id === id ? { ...p, is_available: available } : p
            ),
        });
    },
}));
