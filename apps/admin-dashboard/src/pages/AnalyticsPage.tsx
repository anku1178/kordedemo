import { useEffect, useMemo, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';
import { ShoppingCart, IndianRupee, Package, TrendingUp } from 'lucide-react';
import { useOrderStore } from '../stores/orderStore';
import { useProductStore } from '../stores/productStore';
import { formatCurrency } from '../utils/helpers';

const STATUS_COLORS: Record<string, string> = {
    placed: '#6b7280',
    confirmed: '#3b82f6',
    picking: '#f59e0b',
    ready: '#22c55e',
    handed_over: '#059669',
    cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
    placed: 'Placed',
    confirmed: 'Confirmed',
    picking: 'Picking',
    ready: 'Ready',
    handed_over: 'Completed',
    cancelled: 'Cancelled',
};

export default function AnalyticsPage() {
    const { orders, fetchOrders } = useOrderStore();
    const { products, fetchProducts } = useProductStore();
    const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, [fetchOrders, fetchProducts]);

    const filteredOrders = useMemo(() => {
        if (dateRange === 'all') return orders;
        const days = dateRange === '7d' ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return orders.filter((o) => new Date(o.created_at) >= cutoff);
    }, [orders, dateRange]);

    // KPI calculations
    const totalRevenue = useMemo(
        () =>
            filteredOrders
                .filter((o) => o.payment_status === 'completed')
                .reduce((sum, o) => sum + (o.total || 0), 0),
        [filteredOrders]
    );

    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter((o) => o.status === 'handed_over').length;
    const cancelledOrders = filteredOrders.filter((o) => o.status === 'cancelled').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / (totalOrders - cancelledOrders) || 0 : 0;

    // Orders by status (pie chart)
    const ordersByStatus = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredOrders.forEach((o) => {
            counts[o.status] = (counts[o.status] || 0) + 1;
        });
        return Object.entries(counts).map(([status, count]) => ({
            name: STATUS_LABELS[status] || status,
            value: count,
            color: STATUS_COLORS[status] || '#999',
        }));
    }, [filteredOrders]);

    // Daily revenue (line chart)
    const dailyRevenue = useMemo(() => {
        const daily: Record<string, { date: string; revenue: number; orders: number }> = {};
        filteredOrders
            .filter((o) => o.payment_status === 'completed')
            .forEach((o) => {
                const date = new Date(o.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                });
                if (!daily[date]) daily[date] = { date, revenue: 0, orders: 0 };
                daily[date].revenue += o.total || 0;
                daily[date].orders += 1;
            });
        return Object.values(daily).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [filteredOrders]);

    // Top products (bar chart)
    const topProducts = useMemo(() => {
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        filteredOrders
            .filter((o) => o.payment_status === 'completed' && o.order_items)
            .forEach((o) => {
                o.order_items!.forEach((item) => {
                    if (!productSales[item.product_id]) {
                        productSales[item.product_id] = {
                            name: item.product_name || 'Unknown',
                            quantity: 0,
                            revenue: 0,
                        };
                    }
                    productSales[item.product_id].quantity += item.quantity;
                    productSales[item.product_id].revenue += item.quantity * item.unit_price;
                });
            });
        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }, [filteredOrders]);

    // Category distribution
    const categoryDistribution = useMemo(() => {
        const catCounts: Record<string, number> = {};
        products.forEach((p) => {
            const catName = (p as any).category?.name || 'Uncategorized';
            catCounts[catName] = (catCounts[catName] || 0) + 1;
        });
        return Object.entries(catCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [products]);

    const kpis = [
        {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            icon: IndianRupee,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            label: 'Total Orders',
            value: totalOrders.toString(),
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Avg Order Value',
            value: formatCurrency(avgOrderValue),
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            label: 'Completion Rate',
            value:
                totalOrders > 0
                    ? `${Math.round((completedOrders / totalOrders) * 100)}%`
                    : '0%',
            icon: Package,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Business insights and performance metrics
                    </p>
                </div>
                <div className="flex gap-2">
                    {(['7d', '30d', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${dateRange === range
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'All time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-lg ${kpi.bg}`}>
                            <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{kpi.label}</p>
                            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                    {dailyRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                    dot={{ fill: '#16a34a', r: 4 }}
                                    name="Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No revenue data for this period
                        </div>
                    )}
                </div>

                {/* Orders by Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
                    {ordersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={ordersByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {ordersByStatus.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value: string) => (
                                        <span className="text-xs text-gray-600">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No order data
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
                    {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(v) => `₹${v}`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={120}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                                <Bar dataKey="revenue" fill="#16a34a" radius={[0, 4, 4, 0]} name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No product sales data
                        </div>
                    )}
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h3>
                    {categoryDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Products" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No category data
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders Summary Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Order</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.slice(0, 10).map((order) => (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono font-medium text-green-700">
                                        {order.order_number}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">
                                        {(order as any).customer?.full_name || '—'}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-gray-900">
                                        {formatCurrency(order.total || 0)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'handed_over'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : order.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : order.status === 'ready'
                                                        ? 'bg-green-100 text-green-700'
                                                        : order.status === 'picking'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : order.status === 'confirmed'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">
                                        No orders found for this period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
