# Korde Grocery — Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `korde-grocery`
   - **Database Password**: pick a strong password (save it!)
   - **Region**: choose closest to you
4. Click **"Create new project"** — wait ~2 minutes for it to provision
5. Once ready, go to **Settings → API** — you'll need these values:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon public key** → a long `eyJ...` string
   - **service_role key** → another long `eyJ...` string (keep secret!)

---

## Step 2: Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Run each migration file **in order** (001 through 007):

   **Copy-paste the contents of each file and click Run:**

   | Order | File | What it creates |
   |-------|------|-----------------|
   | 1 | `supabase/migrations/001_create_categories.sql` | Categories table |
   | 2 | `supabase/migrations/002_create_products.sql` | Products table |
   | 3 | `supabase/migrations/003_create_profiles.sql` | Profiles table + auto-create on signup |
   | 4 | `supabase/migrations/004_create_orders.sql` | Orders table |
   | 5 | `supabase/migrations/005_create_order_items.sql` | Order items table |
   | 6 | `supabase/migrations/006_rls_policies.sql` | Row Level Security policies |
   | 7 | `supabase/migrations/007_seed_data.sql` | 15 categories + 90+ products |

   > ⚠️ **Run them in order!** Each one depends on the previous.

4. After running all 7, go to **Table Editor** — you should see tables with data.

---

## Step 3: Enable Phone Auth (for Customer App OTP)

1. In Supabase dashboard, go to **Authentication → Providers**
2. Find **Phone** and enable it
3. Set the **SMS Provider** (Twilio, MessageBird, or Vonage)
   - For testing, you can use **"Enable phone signups without verification"** temporarily
4. Click **Save**

---

## Step 4: Create Admin Account

The admin dashboard uses **email + password** login. You need to create an admin user:

### Option A: Via Supabase Dashboard (Easiest)

1. Go to **Authentication → Users**
2. Click **"Add user" → "Create new user"**
3. Fill in:
   - **Email**: `admin@korde.com` (or whatever you want)
   - **Password**: pick a password
   - **Auto Confirm User**: ✅ check this
4. Click **"Create user"**
5. Now go to **Table Editor → profiles**
6. Find the row for your new user and change the `role` from `customer` to `admin`

### Option B: Via SQL

```sql
-- First create the user via Authentication → Users in dashboard,
-- then run this to set their role to admin:
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-UUID-HERE';
```

---

## Step 5: Configure Environment Variables

### Admin Dashboard

Create `apps/admin-dashboard/.env`:

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from **Step 1**.

### Customer App

Edit `apps/customer-app/app.json` — fill in the `extra` section:

```json
"extra": {
    "supabaseUrl": "https://abcdefgh.supabase.co",
    "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "razorpayKeyId": "rzp_test_xxxxxxxxxxxx"
}
```

Replace with your actual values. For Razorpay, get a test key from [https://dashboard.razorpay.com](https://dashboard.razorpay.com).

---

## Step 6: Enable Realtime (for Live Order Updates)

1. In Supabase dashboard, go to **Database → Replication**
2. Under **supabase_realtime**, enable these tables:
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `profiles`

This allows the admin dashboard to see new orders instantly without refreshing.

---

## Step 7: Install Dependencies

From the project root:

```bash
pnpm install
```

If you don't have pnpm:
```bash
npm install -g pnpm
pnpm install
```

---

## Step 8: Run the Admin Dashboard

```bash
cd apps/admin-dashboard
npx vite --host
```

- Opens at **http://localhost:5173**
- Log in with the admin email/password you created in **Step 4**
- You should see the Orders page with realtime updates

---

## Step 9: Run the Customer App

### On Android (recommended)

```bash
cd apps/customer-app
npx expo start
```

- Press **`a`** to open in Android emulator (or scan QR code with Expo Go on your phone)
- Log in with phone number + OTP

### On Web (for quick preview)

```bash
cd apps/customer-app
npx expo start --web --port 8081
```

- Opens at **http://localhost:8081`
- Note: Some features (Razorpay, push notifications) won't work on web

### On iOS

```bash
cd apps/customer-app
npx expo start
```

- Press **`i`** to open in iOS simulator (macOS only)

---

## Quick Reference

| What | URL / Command |
|------|---------------|
| Supabase Dashboard | https://supabase.com/dashboard |
| Admin Dashboard | http://localhost:5173 |
| Customer App (web) | http://localhost:8081 |
| Admin Login | Email + Password (created in Step 4) |
| Customer Login | Phone Number + OTP |

---

## Troubleshooting

### "Invalid API key" error
→ Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the `.env` file. Restart the dev server after changing `.env`.

### Admin login shows "Invalid login credentials"
→ Make sure you created the user in Supabase Authentication and confirmed their email. Also check the `profiles` table has `role = 'admin'` for that user.

### Customer app can't see products
→ Make sure you ran all 7 migration SQL files, especially `007_seed_data.sql`. Check Table Editor has data.

### Realtime not working (orders don't appear live)
→ Go to Database → Replication and enable `orders`, `order_items`, `profiles` tables.

### Phone OTP not working
→ You need to configure an SMS provider (Twilio, etc.) in Authentication → Providers → Phone. For testing, enable "Confirm phone without verification".

### Razorpay not working
→ You need a Razorpay test key. Sign up at https://dashboard.razorpay.com and get your test key ID. Add it to `app.json` extra section.
