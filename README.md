# TrimTimes — Frontend

Next.js 15 frontend for the TrimTimes multi-tenant barber appointment system. Supports three separate user panels: Super Admin, Barber (shop owner), and Customer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| State | React Context (`authStore`) |
| Icons | Lucide React |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL
```

### 3. Start development server
```bash
npm run dev
# Runs on http://localhost:3000
```

### 4. Build for production
```bash
npm run build
npm run start
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:4000/api/v1`) |

---

## Pages & Features

### Public

| Route | Description |
|---|---|
| `/` | Platform landing page — lists all active shops with rating, status, and a link to each shop's public page |
| `/[tenant]` | Public shop page — shows profile, services/pricing, weekly hours, location, active artisans, and customer reviews |

---

### Super Admin Panel

| Route | Description |
|---|---|
| `/admin/login` | Super admin login (email + password) |
| `/admin/dashboard` | Platform dashboard — tenant table, stats (total shops, bookings, revenue), approve/suspend/delete shops |
| `/admin/tenants` | Tenant management — create new shops, filter by status, approve pending shops |

**Capabilities:**
- View all registered barber shops and their status
- Create a new shop (name, subdomain, owner email)
- Approve shops in `PENDING` status
- Toggle shop status between `ACTIVE` and `SUSPENDED`
- Delete a shop
- Platform stats: total shops, active count, total appointments, total revenue

---

### Barber (Shop Owner) Panel

| Route | Description |
|---|---|
| `/login` | Shop login — select shop from dropdown, enter owner email + password |
| `/signup` | Shop self-registration |
| `/shop/[tenantId]` | Main barber dashboard (tabbed) |
| `/shop/[tenantId]/appointments` | Dedicated appointments management page |

**Barber dashboard tabs:**

| Tab | Capabilities |
|---|---|
| **Overview** | Stats cards (total bookings, pending, confirmed, revenue), recent activity |
| **Shop Profile** | Edit shop name, description, phone, email, banner image URL |
| **Treatments** | Create, edit, delete services (name, description, price, duration, active/inactive) |
| **Hours** | Set open/closed status and open-close times for each day of the week |
| **Location** | Save address fields and a Google Maps embed URL |
| **Artisans** | Add, edit, remove staff members (name, specialty, bio, avatar, active status) |
| **Reviews** | View customer reviews, toggle featured status |

**Appointments page:**
- View all shop appointments with customer details
- Filter by status (`All / PENDING / CONFIRMED / COMPLETED / CANCELLED`) and by date
- Update any appointment's status
- View customer name, email, phone, treatment, artisan, and notes

---

### Customer Panel

| Route | Description |
|---|---|
| `/user/login` | Customer login (global account) |
| `/user/signup` | Customer registration (name, email, phone, password) |
| `/user/[userId]` | Customer dashboard |
| `/[tenant]/login` | Shop-specific login redirect |
| `/[tenant]/register` | Shop-specific registration redirect |
| `/[tenant]/customer/book` | 3-step appointment booking wizard |

**Customer dashboard:**
- Stats: total appointments booked, confirmed count, pending count, total spend
- **Upcoming tab** — cards for all `PENDING` and `CONFIRMED` appointments with cancel button
- **History tab** — table of past (`COMPLETED` / `CANCELLED`) appointments
- Edit profile (display name)

**Booking wizard (`/[tenant]/customer/book`):**

Step 1 — **Select Treatment**
- Lists all active treatments for the shop with name, description, duration, and price

Step 2 — **Choose Date, Artisan & Time**
- Date picker shows the next 14 days; days when the shop is closed are disabled and labelled "Closed"
- Artisan selector shows all active staff (optional — booking proceeds without one)
- Time slot grid is **dynamically fetched** from the API based on the selected date, treatment, and artisan:
  - Only slots within the shop's open hours are shown
  - Slots already taken by a confirmed/pending booking are hidden
  - If an artisan is selected, only that artisan's availability is checked
  - Shows a spinner while loading, a "Shop closed" message, or a "no slots" message when fully booked

Step 3 — **Confirm & Submit**
- Review summary (treatment, artisan, date, time, price)
- Optional notes field
- Submits booking; conflict-checked server-side with a `409` if the slot was taken between steps
- Success modal with booking reference ID

---

## Auth & Session Management

- **Shop / Customer tokens** are stored in `localStorage` and sent as `Authorization: Bearer` headers. An `httpOnly` refresh token cookie handles silent token renewal.
- **Admin token** is stored separately in `localStorage` under a distinct key.
- A `tt_session` cookie is set on login so the Next.js middleware can gate protected routes server-side without reading `localStorage`.
- The middleware (`middleware.ts`) protects `/admin/*`, `/shop/*`, and `/user/*` routes — unauthenticated requests are redirected to the appropriate login page.

---

## Role-Based Routing

| User type | Protected prefix | Redirect on no auth |
|---|---|---|
| Super Admin | `/admin/*` | `/admin/login` |
| Barber (shop) | `/shop/*` | `/login` |
| Customer | `/user/*` | `/user/login` |

---

## Assumptions

- Customer accounts are global — one account works across all shops.
- Shop registration via `/signup` creates a `PENDING` shop that must be approved by a super admin before it goes live.
- Time slots are displayed and validated in **30-minute increments**. The treatment's `duration` (in minutes) determines how many consecutive slots a booking occupies, preventing back-to-back overlap.
- The booking page requires a logged-in customer session. Unauthenticated users who reach Step 3 are redirected to `/user/login` with a return URL.
