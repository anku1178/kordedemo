# 🛒 Korde Grocery — E-Commerce Pickup Platform

A full-stack grocery ordering platform for **Korde Grocery Store** with a customer mobile app and admin dashboard. Customers browse products, place orders, pay via Razorpay, and pick up at the store. Workers manage orders in real-time via the admin dashboard.

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Customer App      │     │   Admin Dashboard   │
│   (React Native)    │     │   (React + Vite)    │
│   Expo + Paper      │     │   Tailwind + Recharts│
└──────────┬──────────┘     └──────────┬──────────┘
           │                            │
           └──────────┬─────────────────┘
                      │
           ┌──────────▼──────────┐
           │     Supabase        │
           │  • PostgreSQL       │
           │  • Auth (OTP/Email) │
           │  • Realtime         │
           │  • Edge Functions   │
           │  • Storage          │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │     Razorpay        │
           │  UPI / Cards / Wallets│
           └─────────────────────┘
```

## Project Structure

```
kordeproject/
├── apps/
│   ├── customer-app/          # React Native Expo app
│   │   ├── src/
│   │   │   ├── navigation/    # App navigator with auth gating
│   │   │   ├── screens/       # All screens (Login, Home, Cart, etc.)
│   │   │   ├── services/      # Supabase client
│   │   │   ├── stores/        # Zustand stores (auth, cart, order)
│   │   │   └── theme/         # MD3 theme config
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   └── admin-dashboard/       # React + Vite dashboard
│       ├── src/
│       │   ├── pages/         # Orders, Products, Analytics, Login
│       │   ├── services/      # Supabase client
│       │   ├── stores/        # Zustand stores (auth, order, product)
│       │   └── utils/         # Helpers, formatters
│       ├── index.html
│       └── package.json
│
├── shared/                    # Shared TypeScript types
│   ├── types/
│   │   ├── product.ts         # Category, Product interfaces
│   │   ├── order.ts           # Order, OrderItem, OrderStatus
│   │   └── user.ts            # Profile, UserRole
│   └── index.ts
│
├── supabase/
│   ├── migrations/            # 7 SQL migration files
│   │   ├── 001_create_categories.sql
│   │   ├── 002_create_products.sql
│   │   ├── 003_create_profiles.sql
│   │   ├── 004_create_orders.sql
│   │   ├── 005_create_order_items.sql
│   │   ├── 006_rls_policies.sql
│   │   └── 007_seed_data.sql
│   └── functions/
│       ├── verify-payment/    # Razorpay signature verification
│       └── generate-order-number/  # KGS-000001 format
│
├── plans/
│   └── architecture-plan.md   # Detailed architecture document
│
├── pnpm-workspace.yaml
└── package.json
```

## Features

### Customer App
- **Phone OTP Login** — +91 phone number with Supabase Auth
- **Browse Products** — Categories grid, featured products, search with debounce
- **Product Detail** — Discount badge, quantity selector, add to cart
- **Cart** — Persistent (MMKV), quantity controls, subtotal/discount/total
- **Checkout** — Order summary, Razorpay payment integration
- **Order Tracking** — Real-time status timeline (placed → confirmed → picking → ready → handed_over)
- **"I'm Outside" Toggle** — Notifies admin that customer is waiting
- **Order History** — Past orders with status chips

### Admin Dashboard
- **Email/Password Login** — Single admin account for all workers
- **Order Queue** — Real-time incoming orders with filter tabs
- **Order Detail Modal** — Customer info, items list, status action buttons
- **"Customer Outside" Badge** — Orange pulsing badge when customer flags
- **Product Management** — Full CRUD, toggle availability, search
- **Category Management** — Add categories inline
- **Analytics** — Revenue trend, orders by status, top products, category distribution
- **Code-Split** — Lazy-loaded pages for fast initial load

## Order Flow

```
Customer places order → pays via Razorpay → Order ID generated (KGS-000042)
                                                    │
Admin sees order in dashboard ──────────────────────┘
        │
        ▼
    Confirm Order → Start Picking → Mark Ready
                                        │
        Customer gets "Ready" notification ─┘
                                        │
        Customer toggles "I'm Outside" ──┘
                                        │
        Admin sees "Outside" badge ──────┘
                                        │
        Hand Over → Order Complete ──────┘
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- pnpm (installed via `npm install -g pnpm`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)
- Expo Go app on your phone (for customer app testing)

### 1. Install Dependencies

```bash
npm install -g pnpm
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the project URL and anon key
3. Run migrations in the SQL Editor (in order: 001 through 007)
4. Or use the Supabase CLI:
   ```bash
   supabase init
   supabase link --project-ref your-project-ref
   supabase db push
   ```

### 3. Configure Environment Variables

**Admin Dashboard** (`apps/admin-dashboard/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Customer App** (`apps/customer-app/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 4. Create Admin User

In Supabase SQL Editor:
```sql
-- First sign up via Auth dashboard with email/password
-- Then set the role to admin:
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
```

### 5. Run Development Servers

```bash
# Admin dashboard
pnpm dev:admin

# Customer app
pnpm dev:app

# Or run both
pnpm dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Customer App | React Native, Expo, React Native Paper (MD3) |
| Admin Dashboard | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| State Management | Zustand (both apps) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions, Storage) |
| Payments | Razorpay (UPI, Cards, Wallets) |
| Local Storage | MMKV (customer app cart persistence) |
| Monorepo | pnpm workspaces |
| Shared Types | TypeScript interfaces |

## Database Schema

### Tables
- **categories** — id, name, slug, image_url, sort_order
- **products** — id, name, slug, description, price, mrp, unit, image_url, category_id, is_available, stock
- **profiles** — id (→ auth.users), full_name, phone, role (customer/admin)
- **orders** — id, order_number (KGS-000001), customer_id, status, total_amount, discount, payment_id, payment_status, customer_outside, confirmed_at, ready_at, picked_up_at
- **order_items** — id, order_id, product_id, product_name, quantity, unit_price

### Row Level Security
- Customers can only read available products/categories
- Customers can only see their own orders
- Admin can see and update all orders/products
- `is_admin()` helper function for RLS policies

## Deployment

### Admin Dashboard (Vercel/Netlify)
```bash
cd apps/admin-dashboard
pnpm build
# Deploy the dist/ folder
```

### Customer App (EAS Build)
```bash
cd apps/customer-app
npx eas build --platform android
npx eas build --platform ios
```

### Edge Functions
```bash
supabase functions deploy verify-payment
supabase functions deploy generate-order-number
```

## License

Private — Korde Grocery Store
