# Korde Grocery — Core Architecture

## High-Level Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   Customer App      │     │   Admin Dashboard   │
│   (React Native     │     │   (React + Vite     │
│    + Expo SDK 54)   │     │    + Tailwind)      │
│   Port 8081/8082    │     │   Port 5173         │
└────────┬────────────┘     └────────┬────────────┘
         │                           │
         │    Supabase Client SDK    │
         │    (@supabase/supabase-js)│
         └───────────┬───────────────┘
                     │
         ┌───────────▼───────────────┐
         │       Supabase Cloud      │
         │  ┌─────────────────────┐  │
         │  │  PostgreSQL Database │  │
         │  │  (5 tables + RLS)   │  │
         │  ├─────────────────────┤  │
         │  │  GoTrue Auth        │  │
         │  │  (email/password)   │  │
         │  ├─────────────────────┤  │
         │  │  Realtime Engine    │  │
         │  │  (order status,     │  │
         │  │   outside toggle)   │  │
         │  ├─────────────────────┤  │
         │  │  Edge Functions     │  │
         │  │  (Deno runtime)     │  │
         │  └─────────────────────┘  │
         └───────────────────────────┘
```

---

## 1. Monorepo Structure

```
kordeproject/
├── apps/
│   ├── customer-app/     ← Mobile app (React Native + Expo)
│   └── admin-dashboard/  ← Web dashboard (React + Vite)
├── shared/               ← Shared TypeScript types
├── supabase/             ← Database migrations + Edge Functions
└── plans/                ← Architecture docs
```

Managed with **pnpm workspaces** (`pnpm-workspace.yaml`). The `shared/` package exports TypeScript interfaces (`Product`, `Order`, `Category`, `Profile`) used by both apps. For the customer app, a **junction symlink** resolves the shared types through Metro bundler.

---

## 2. Database Layer (Supabase PostgreSQL)

### 5 tables with Row Level Security

```
auth.users ──1:1──> profiles
                          │
categories ──1:N──> products
                          │
                    orders ──1:N──> order_items ──N:1──> products
                     │
                     └── N:1 ──> profiles (customer)
```

| Table | Purpose | Key Columns |
|---|---|---|
| `categories` | Product categories (15 seeded) | `name`, `slug`, `sort_order` |
| `products` | Grocery items (~100 seeded) | `name`, `price`, `unit`, `stock_quantity`, `is_available`, `category_id` FK |
| `profiles` | Extends `auth.users` | `full_name`, `phone`, `role` (customer/admin) |
| `orders` | Customer orders | `order_number` (KGS-000001), `status`, `payment_status`, `customer_outside`, `customer_id` FK |
| `order_items` | Line items per order | `product_name`, `quantity`, `unit_price`, `total_price` (snapshotted) |

### RLS Policies (`006_rls_policies.sql`)

- Customers can only see/edit their own data
- Admins can see/edit everything
- Helper functions `is_admin()` and `current_user_role()` simplify policy logic
- Categories/products are publicly readable; writes are admin-only

### Realtime

Enabled on all tables — the customer app subscribes to order status changes, and the admin dashboard subscribes to new incoming orders.

---

## 3. Authentication Flow

```
Customer App                    Supabase GoTrue              Database
    │                               │                          │
    │  signIn(email, password)      │                          │
    │──────────────────────────────>│                          │
    │                               │  Verify credentials      │
    │                               │─────────────────────────>│
    │                               │                          │
    │  session + JWT                │                          │
    │<──────────────────────────────│                          │
    │                               │                          │
    │  (auto-trigger)               │  on_auth_user_created    │
    │                               │─────────────────────────>│
    │                               │  INSERT INTO profiles    │
    │                               │  (from raw_user_meta_data)│
    │                               │                          │
```

- `authStore.ts` (customer) and `authStore.ts` (admin) both use `supabase.auth`
- On signup, a PostgreSQL trigger (`003_create_profiles.sql`) auto-creates a `profiles` row
- The JWT token is sent with every Supabase request — RLS policies use `auth.uid()` to determine access
- Admin vs customer is determined by the `role` field in `profiles`

---

## 4. Customer App Architecture (React Native + Expo)

**Stack:** Expo SDK 54 → React Native 0.81 → React 19 → React Navigation 7 → React Native Paper 5 (MD3) → Zustand 5

```
App.tsx
  └── ErrorBoundary
      └── AppContent
          └── SafeAreaProvider
              └── PaperProvider (Material Design 3 theme)
                  └── NavigationContainer
                      └── AppNavigator
                          ├── HomeTabs (Bottom Tab Navigator)
                          │   ├── HomeScreen
                          │   ├── SearchScreen
                          │   ├── CartScreen
                          │   ├── OrdersTab (OrderHistoryScreen)
                          │   └── ProfileScreen
                          └── Stack Navigator (modal screens)
                              ├── LoginScreen
                              ├── ProductScreen
                              ├── CategoryScreen
                              ├── CheckoutScreen
                              └── OrderTrackingScreen
```

### State Management (3 Zustand stores)

| Store | File | Purpose | Persist? |
|---|---|---|---|
| `useAuthStore` | `src/stores/authStore.ts` | Auth state, session, profile | No (rehydrates from Supabase session) |
| `useCartStore` | `src/stores/cartStore.ts` | Cart items, add/remove/quantity | ✅ AsyncStorage |
| `useOrderStore` | `src/stores/orderStore.ts` | Orders, create, track, cancel, outside toggle | No (fetched from Supabase) |

### Key Flows

- **Browse → Cart → Checkout:** HomeScreen shows categories + products → add to cart (Zustand + AsyncStorage) → CheckoutScreen creates order via Supabase → order_items inserted with RLS policy
- **Order Tracking:** Subscribes to Supabase Realtime on the `orders` table → timeline updates live when admin changes status
- **"I'm Outside" toggle:** Customer flips `customer_outside` boolean → admin sees it in real-time on the dashboard

---

## 5. Admin Dashboard Architecture (React + Vite)

**Stack:** Vite → React 18 → React Router 6 → Tailwind CSS → Zustand → Recharts

```
App.tsx
  └── BrowserRouter
      ├── Routes
      │   ├── /login → LoginPage
      │   └── /* → ProtectedLayout (auth guard)
      │       ├── Sidebar (navigation)
      │       └── Main content
      │           ├── /orders → OrdersPage
      │           ├── /products → ProductsPage
      │           └── /analytics → AnalyticsPage
```

### State Management (3 Zustand stores)

| Store | File | Purpose |
|---|---|---|
| `useAuthStore` | `src/stores/authStore.ts` | Admin auth, session |
| `useProductStore` | `src/stores/productStore.ts` | Products + categories CRUD |
| `useOrderStore` | `src/stores/orderStore.ts` | Orders, status updates, realtime subscription |

### Key Flows

- **Order Management:** Real-time subscription shows new orders instantly → admin updates status (placed→confirmed→picking→ready→handed_over) → customer sees update live
- **Product Management:** Full CRUD for products and categories → changes reflect immediately for customers
- **Analytics:** Revenue charts, order status distribution, top products, category breakdown (all computed client-side from fetched data)

---

## 6. Realtime Data Flow

```
Customer places order
        │
        ▼
  orders table INSERT
        │
        ├──> Supabase Realtime broadcast
        │         │
        │         ▼
        │    Admin Dashboard (subscribed)
        │    → New order notification + sound
        │
        ▼
Admin updates status (e.g. "ready")
        │
        ├──> orders table UPDATE
        │         │
        │         ▼
        │    Customer App (subscribed to specific order)
        │    → Timeline updates, "I'm Outside" toggle appears
        │
        ▼
Customer toggles "I'm Outside"
        │
        ├──> orders table UPDATE (customer_outside = true)
        │         │
        │         ▼
        │    Admin Dashboard (realtime)
        │    → Green badge shows customer is waiting
        │
        ▼
Admin marks "Handed Over"
        │
        ├──> payment_status auto-set to 'completed'
        │
        ▼
    Order complete ✅
```

---

## 7. Edge Functions (Deno)

| Function | File | Purpose | Active? |
|---|---|---|---|
| `generate-order-number` | `supabase/functions/generate-order-number/index.ts` | Generates `KGS-XXXXXX` format order numbers | ✅ Used during checkout |
| `verify-payment` | `supabase/functions/verify-payment/index.ts` | Razorpay HMAC-SHA256 signature verification | ❌ Not used (Pay on Pickup only) |

---

## 8. Design System — "Fresh Market"

The customer app uses a consistent design language defined in `src/theme/index.ts`:

| Token | Value | Usage |
|---|---|---|
| Primary | `#2E7D32` (forest green) | Buttons, headers, accents |
| Secondary | `#F57C00` (amber) | Badges, highlights |
| Background | `#F5F5F0` (warm off-white) | Screen backgrounds |
| Surface | `#FFFFFF` | Cards, modals |
| Roundness | `16` | Border radius for all components |
| Shadows | sm/md/lg | Card elevation hierarchy |

---

## 9. How Everything Connects — One Complete Flow

**Customer buys Basmati Rice:**

1. Opens app → `HomeScreen` fetches categories + products from Supabase
2. Taps "Grains & Rice" → `CategoryScreen` shows filtered products
3. Taps "India Gate Basmati" → `ProductScreen` shows detail
4. Taps "ADD" → `useCartStore` adds item, persists to AsyncStorage
5. Goes to Cart → `CartScreen` shows items with quantity controls
6. Taps Checkout → `CheckoutScreen` calls Edge Function for order number, inserts into `orders` + `order_items`
7. Realtime notifies admin → `OrdersPage` shows new order with notification sound
8. Admin confirms → status changes → customer's `OrderTrackingScreen` updates timeline in real-time
9. Admin marks "ready" → customer sees "I'm Outside" toggle
10. Customer arrives, toggles "I'm Outside" → admin sees green badge
11. Admin hands over → payment auto-marked complete → order done ✅

---

## 10. Database Migrations Summary

| # | File | Purpose |
|---|---|---|
| 001 | `create_categories.sql` | Categories table + realtime |
| 002 | `create_products.sql` | Products table + pg_trgm search + updated_at trigger |
| 003 | `create_profiles.sql` | Profiles table + auto-create on signup trigger |
| 004 | `create_orders.sql` | Orders table + order number generation function |
| 005 | `create_order_items.sql` | Order items table |
| 006 | `rls_policies.sql` | Row Level Security on all tables + helper functions |
| 007 | `seed_data.sql` | 15 categories + ~100 products with MRP pricing |
| 008 | `fix_order_items_rls.sql` | Allow customers to insert their own order items |
| 009 | `reseed_products.sql` | Re-seed with mrp=price (discount feature removed) |

---

## 11. Known Issues & Technical Debt

| Severity | Issue | Recommendation |
|---|---|---|
| 🔴 Critical | `mrp` column still exists but is unused | Create migration to DROP the `mrp` column from products |
| 🔴 Critical | `discount` column still exists but is always 0 | Create migration to DROP the `discount` column from orders |
| ⚠️ Medium | `stock_quantity` and `quantity` use NUMERIC instead of INTEGER | Alter columns to INTEGER |
| ⚠️ Medium | Duplicate order number generation (SQL function + Edge Function) | Remove one — keep the Edge Function since it's what the app actually calls |
| ⚠️ Medium | `payment_id`, `payment_method` columns unused | Drop or keep for future Razorpay integration |
| ⚠️ Medium | No `updated_at` on profiles | Add column + trigger |
| ⚠️ Medium | No `cancelled_at` on orders | Add column, set in cancel flow |
| ⚠️ Low | `verify-payment` Edge Function unused | Keep for future or remove |
| ⚠️ Low | No unit snapshot in order_items | Add `product_unit` column |
| ⚠️ Low | Profile creation error swallowing | Log errors instead of silent catch |
