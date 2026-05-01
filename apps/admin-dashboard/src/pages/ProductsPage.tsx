import React, { useEffect, useState } from 'react';
import { useProductStore } from '../stores/productStore';
import { formatCurrency } from '../utils/helpers';
import type { ProductInsert } from 'shared-types';

export function ProductsPage() {
    const { products, categories, fetchProducts, fetchCategories, addProduct, updateProduct, deleteProduct, toggleAvailability, loading } = useProductStore();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<ProductInsert>({
        name: '',
        price: 0,
        unit: 'pcs',
        stock_quantity: 0,
        is_available: true,
        category_id: '',
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const filteredProducts = search
        ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : products;

    const resetForm = () => {
        setForm({ name: '', price: 0, unit: 'pcs', stock_quantity: 0, is_available: true, category_id: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (product: typeof products[0]) => {
        setForm({
            name: product.name,
            price: product.price,
            unit: product.unit,
            stock_quantity: product.stock_quantity,
            is_available: product.is_available,
            category_id: product.category_id,
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await updateProduct(editingId, form);
        } else {
            await addProduct(form);
        }
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">{products.length} products</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                    + Add Product
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />

            {/* Product Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={resetForm}>
                    <form className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                        <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add Product'}</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.price || ''}
                                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <input
                                    type="text"
                                    value={form.unit}
                                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="1 kg, 500 ml, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input
                                    type="number"
                                    value={form.stock_quantity || ''}
                                    onChange={(e) => setForm({ ...form, stock_quantity: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={resetForm} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition">
                                {editingId ? 'Update' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Unit</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600">Stock</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Available</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{product.category?.name || '-'}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(product.price)}</td>
                                    <td className="px-4 py-3 text-gray-500">{product.unit}</td>
                                    <td className="px-4 py-3 text-right">{product.stock_quantity}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => toggleAvailability(product.id, !product.is_available)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {product.is_available ? 'Yes' : 'No'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">
                                            Edit
                                        </button>
                                        <button onClick={() => { if (confirm('Delete this product?')) deleteProduct(product.id); }} className="text-red-600 hover:text-red-800 font-medium">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
