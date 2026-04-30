import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { formatCurrency, formatDate, statusColors, statusLabels, nextStatus, nextStatusLabel } from '../utils/helpers';
import type { Order, OrderStatus } from 'shared-types';
import { ShoppingCart, Clock, X, AlertCircle } from 'lucide-react';

// Simple beep using Web Audio API
function playNotificationSound() {
    try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gain.gain.value = 0.3;
        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch {
        // Audio not supported, silently ignore
    }
}

export function OrdersPage() {
    const { orders, fetchOrders, updateOrderStatus, subscribeToOrders, loading } = useOrderStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const prevOrderCountRef = useRef<number>(0);

    useEffect(() => {
        fetchOrders();
        const unsubscribe = subscribeToOrders();
        return () => unsubscribe();
    }, []);

    // Play sound when new order arrives
    useEffect(() => {
        const activeOrders = orders.filter((o) => !['handed_over', 'cancelled'].includes(o.status));
        if (activeOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
            playNotificationSound();
        }
        prevOrderCountRef.current = activeOrders.length;
    }, [orders]);

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter((o) => o.status === filter);

    const activeOrders = orders.filter((o) => !['handed_over', 'cancelled'].includes(o.status));

    const handleStatusUpdate = useCallback(async (orderId: string, currentStatus: string) => {
        const next = nextStatus[currentStatus];
        if (!next) return;
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, next as OrderStatus);
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: next as OrderStatus });
            }
        } finally {
            setUpdating(null);
        }
    }, [selectedOrder, updateOrderStatus]);

    const handleCancelOrder = useCallback(async (orderId: string) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, 'cancelled');
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
            }
        } finally {
            setUpdating(null);
        }
    }, [selectedOrder, updateOrderStatus]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-500">{activeOrders.length} active orders</p>
                </div>
                <button
                    onClick={() => fetchOrders()}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition"
                >
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'placed', 'confirmed', 'picking', 'ready', 'handed_over', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {status === 'all' ? 'All' : statusLabels[status]}
                        {status !== 'all' && (
                            <span className="ml-1.5 text-xs">
                                ({orders.filter((o) => o.status === status).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Orders Grid */}
            {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p>Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm">
                        {filter === 'all' ? 'Orders will appear here when customers place them' : `No ${statusLabels[filter]} orders`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className={`bg-white rounded-xl border p-4 space-y-3 cursor-pointer hover:shadow-md transition ${order.customer_outside && order.status === 'ready'
                                    ? 'ring-2 ring-orange-400 animate-pulse'
                                    : order.status === 'placed'
                                        ? 'ring-2 ring-blue-400'
                                        : ''
                                }`}
                            onClick={() => setSelectedOrder(order)}
                        >
                            {/* Order Header */}
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-green-700">{order.order_number}</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                                    {statusLabels[order.status]}
                                </span>
                            </div>

                            {/* Customer Outside Badge */}
                            {order.customer_outside && (
                                <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                                    📍 Customer is outside!
                                </div>
                            )}

                            {/* New Order Indicator */}
                            {order.status === 'placed' && (
                                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> New Order
                                </div>
                            )}

                            {/* Order Info */}
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Items</span>
                                    <span className="font-medium">{order.order_items?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-semibold text-green-700">{formatCurrency(order.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Time</span>
                                    <span className="text-gray-600">{formatDate(order.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment</span>
                                    <span className={order.payment_status === 'completed' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                                        {order.payment_status === 'completed' ? '✓ Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {nextStatus[order.status] && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(order.id, order.status);
                                    }}
                                    disabled={updating === order.id}
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition disabled:opacity-50"
                                >
                                    {updating === order.id ? 'Updating...' : nextStatusLabel[order.status]}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-green-700">{selectedOrder.order_number}</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {selectedOrder.customer_outside && (
                            <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                                📍 Customer is waiting outside!
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedOrder.status]}`}>
                                {statusLabels[selectedOrder.status]}
                            </span>
                            <span className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</span>
                        </div>

                        {/* Customer Info */}
                        {selectedOrder.customer && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedOrder.customer.full_name || 'Customer'}
                                </p>
                                <p className="text-sm text-gray-500">{selectedOrder.customer.phone || ''}</p>
                            </div>
                        )}

                        {/* Items List */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                            <div className="space-y-2">
                                {selectedOrder.order_items?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <div>
                                            <span className="font-medium text-gray-900">{item.product_name}</span>
                                            <span className="text-gray-400 ml-2">×{item.quantity}</span>
                                        </div>
                                        <span className="font-semibold">{formatCurrency(item.total_price)}</span>
                                    </div>
                                ))}
                                {(!selectedOrder.order_items || selectedOrder.order_items.length === 0) && (
                                    <p className="text-sm text-gray-400 py-2">No items</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span>{formatCurrency(selectedOrder.subtotal)}</span>
                            </div>
                            {selectedOrder.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Discount</span>
                                    <span className="text-green-600">-{formatCurrency(selectedOrder.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total</span>
                                <span className="text-green-700">{formatCurrency(selectedOrder.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment</span>
                                <span className={selectedOrder.payment_status === 'completed' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                                    {selectedOrder.payment_status === 'completed' ? '✓ Paid' : 'Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            {nextStatus[selectedOrder.status] && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder.id, selectedOrder.status)}
                                    disabled={updating === selectedOrder.id}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                    {updating === selectedOrder.id ? 'Updating...' : nextStatusLabel[selectedOrder.status]}
                                </button>
                            )}

                            {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'handed_over' && (
                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                    disabled={updating === selectedOrder.id}
                                    className="w-full py-3 bg-white border border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
