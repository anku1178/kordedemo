import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import {
    ShoppingCart,
    Package,
    BarChart3,
    LogOut,
    Store,
} from 'lucide-react';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';

// Lazy-load pages for code-splitting
const OrdersPage = lazy(() =>
    import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage }))
);
const ProductsPage = lazy(() =>
    import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

function PageLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function ProtectedLayout() {
    const { user, signOut } = useAuthStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { to: '/orders', icon: ShoppingCart, label: 'Orders' },
        { to: '/products', icon: Package, label: 'Products' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-lg leading-tight">
                                Korde Grocery
                            </h1>
                            <p className="text-xs text-gray-500">Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User / Sign Out */}
                <div className="p-3 border-t border-gray-200">
                    <div className="px-3 py-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user.phone || 'Admin'}
                        </p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6 max-w-7xl mx-auto">
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="*" element={<Navigate to="/orders" replace />} />
                        </Routes>
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

export default function App() {
    const { initialize, initialized, user } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (!initialized) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={user ? <Navigate to="/orders" replace /> : <LoginPage />}
                />
                <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
        </BrowserRouter>
    );
}
