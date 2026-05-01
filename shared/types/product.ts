export interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    sort_order: number;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    price: number;
    unit: string;
    stock_quantity: number;
    is_available: boolean;
    category_id: string;
    category?: Category;
    created_at: string;
    updated_at: string;
}

export interface ProductInsert {
    name: string;
    slug?: string;
    description?: string | null;
    image_url?: string | null;
    price: number;
    unit: string;
    stock_quantity?: number;
    is_available?: boolean;
    category_id: string;
}

export interface ProductUpdate {
    name?: string;
    slug?: string;
    description?: string | null;
    image_url?: string | null;
    price?: number;
    unit?: string;
    stock_quantity?: number;
    is_available?: boolean;
    category_id?: string;
}
