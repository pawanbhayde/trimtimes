# TrimTimes — Shop Management API Integration Guide

> Base URL: `http://localhost:4000/api/v1` (dev)  
> All authenticated endpoints require: `Authorization: Bearer <accessToken>`  
> Tenant context is derived from the JWT — **never pass a tenant ID in mutation request bodies.**

---

## Endpoint Overview

| Method   | Path                          | Auth | Description              |
|----------|-------------------------------|------|--------------------------|
| `GET`    | `/shops/:slug/profile`        | No   | Public shop profile      |
| `GET`    | `/shops/:slug/treatments`     | No   | Treatments list          |
| `GET`    | `/shops/:slug/hours`          | No   | Weekly operating hours   |
| `GET`    | `/shops/:slug/location`       | No   | Address + map data       |
| `GET`    | `/shops/:slug/artisans`       | No   | Artisans list            |
| `GET`    | `/shops/:slug/reviews`        | No   | Customer reviews         |
| `PUT`    | `/shops/profile`              | Yes  | Update shop profile      |
| `POST`   | `/shops/treatments`           | Yes  | Create treatment         |
| `PUT`    | `/shops/treatments/:id`       | Yes  | Update treatment         |
| `DELETE` | `/shops/treatments/:id`       | Yes  | Delete treatment         |
| `PUT`    | `/shops/hours`                | Yes  | Replace weekly schedule  |
| `PUT`    | `/shops/location`             | Yes  | Update location          |
| `POST`   | `/shops/artisans`             | Yes  | Add artisan              |
| `PUT`    | `/shops/artisans/:id`         | Yes  | Update artisan           |
| `DELETE` | `/shops/artisans/:id`         | Yes  | Remove artisan           |
| `PATCH`  | `/shops/reviews/:id`          | Yes  | Toggle review featured   |

---

## TypeScript Types

```ts
// lib/types/shop.ts

export interface ShopProfile {
  id: string;          // same as slug
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  ownerName: string;
  bannerUrl: string;
  rating: number;
  reviewCount: number;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;       // dollars, e.g. 35
  duration: number;    // minutes
  status: 'Active' | 'Inactive';
}

export interface HourEntry {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string;    // "HH:mm" 24-hour
  closeTime: string;   // "HH:mm" 24-hour
}

export interface ShopLocation {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  mapEmbedUrl: string | null;
}

export interface Artisan {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;      // 1–5
  comment: string;
  createdAt: string;   // ISO 8601
  isFeatured: boolean;
}
```

---

## API Helper (`lib/shopApi.ts`)

```ts
import { api } from './api'; // the axios instance with auth interceptors (see FRONTEND_INTEGRATION.md)

// ─── Public reads (no token needed) ──────────────────────────────────────────

export const shopApi = {
  getProfile: (slug: string) =>
    api.get<ShopProfile>(`/shops/${slug}/profile`).then((r) => r.data),

  getTreatments: (slug: string) =>
    api.get<{ treatments: Treatment[] }>(`/shops/${slug}/treatments`).then((r) => r.data.treatments),

  getHours: (slug: string) =>
    api.get<{ hours: HourEntry[] }>(`/shops/${slug}/hours`).then((r) => r.data.hours),

  getLocation: (slug: string) =>
    api.get<ShopLocation>(`/shops/${slug}/location`).then((r) => r.data),

  getArtisans: (slug: string) =>
    api.get<{ artisans: Artisan[] }>(`/shops/${slug}/artisans`).then((r) => r.data.artisans),

  getReviews: (slug: string) =>
    api.get<{ reviews: Review[] }>(`/shops/${slug}/reviews`).then((r) => r.data.reviews),

  // ─── Authenticated mutations ────────────────────────────────────────────────

  updateProfile: (data: Partial<Pick<ShopProfile, 'name' | 'description' | 'phone' | 'email' | 'ownerName' | 'bannerUrl'>>) =>
    api.put<ShopProfile>('/shops/profile', data).then((r) => r.data),

  createTreatment: (data: Omit<Treatment, 'id'>) =>
    api.post<Treatment>('/shops/treatments', data).then((r) => r.data),

  updateTreatment: (id: string, data: Partial<Omit<Treatment, 'id'>>) =>
    api.put<Treatment>(`/shops/treatments/${id}`, data).then((r) => r.data),

  deleteTreatment: (id: string) =>
    api.delete(`/shops/treatments/${id}`),

  updateHours: (hours: HourEntry[]) =>
    api.put<{ hours: HourEntry[] }>('/shops/hours', { hours }).then((r) => r.data.hours),

  updateLocation: (data: Partial<ShopLocation>) =>
    api.put<ShopLocation>('/shops/location', data).then((r) => r.data),

  createArtisan: (data: Omit<Artisan, 'id'>) =>
    api.post<Artisan>('/shops/artisans', data).then((r) => r.data),

  updateArtisan: (id: string, data: Partial<Omit<Artisan, 'id'>>) =>
    api.put<Artisan>(`/shops/artisans/${id}`, data).then((r) => r.data),

  deleteArtisan: (id: string) =>
    api.delete(`/shops/artisans/${id}`),

  setReviewFeatured: (id: string, isFeatured: boolean) =>
    api.patch<Review>(`/shops/reviews/${id}`, { isFeatured }).then((r) => r.data),
};
```

---

## Usage Examples

### Public Shop Page — load everything in parallel

```tsx
// app/shop/[slug]/page.tsx
import { shopApi } from '@/lib/shopApi';

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const [profile, treatments, hours, location, artisans, reviews] = await Promise.all([
    shopApi.getProfile(params.slug),
    shopApi.getTreatments(params.slug),
    shopApi.getHours(params.slug),
    shopApi.getLocation(params.slug),
    shopApi.getArtisans(params.slug),
    shopApi.getReviews(params.slug),
  ]);

  return (
    <>
      <ShopHeader profile={profile} />
      <TreatmentList treatments={treatments.filter((t) => t.status === 'Active')} />
      <HoursTable hours={hours} />
      <LocationMap location={location} />
      <ArtisanGrid artisans={artisans.filter((a) => a.isActive)} />
      <ReviewList reviews={reviews} />
    </>
  );
}
```

---

### Dashboard — Update Shop Profile

```tsx
// app/shop/[slug]/settings/profile/page.tsx
'use client';

import { useState } from 'react';
import { shopApi } from '@/lib/shopApi';

export default function ProfileSettings({ initialProfile }: { initialProfile: ShopProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await shopApi.updateProfile({
        name: profile.name,
        description: profile.description,
        phone: profile.phone,
        email: profile.email,
        ownerName: profile.ownerName,
        bannerUrl: profile.bannerUrl,
      });
      setProfile(updated);
    } catch (err: any) {
      const { code, message } = err.response?.data?.error ?? {};
      setError(message ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
      <textarea value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} />
      {/* ... other fields */}
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
    </form>
  );
}
```

---

### Dashboard — Manage Treatments

```tsx
'use client';

import { useState } from 'react';
import { shopApi } from '@/lib/shopApi';

export default function TreatmentsManager({ initial }: { initial: Treatment[] }) {
  const [treatments, setTreatments] = useState(initial);

  async function handleCreate(formData: Omit<Treatment, 'id'>) {
    const created = await shopApi.createTreatment(formData);
    setTreatments((prev) => [...prev, created]);
  }

  async function handleUpdate(id: string, patch: Partial<Treatment>) {
    const updated = await shopApi.updateTreatment(id, patch);
    setTreatments((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: string) {
    await shopApi.deleteTreatment(id);
    setTreatments((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleToggleStatus(t: Treatment) {
    const updated = await shopApi.updateTreatment(t.id, {
      status: t.status === 'Active' ? 'Inactive' : 'Active',
    });
    setTreatments((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
  }

  return (
    <ul>
      {treatments.map((t) => (
        <li key={t.id}>
          <span>{t.name} — ${t.price} — {t.duration}min — {t.status}</span>
          <button onClick={() => handleToggleStatus(t)}>Toggle</button>
          <button onClick={() => handleDelete(t.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

---

### Dashboard — Update Weekly Hours

```tsx
'use client';

import { useState } from 'react';
import { shopApi } from '@/lib/shopApi';

const ALL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as const;

export default function HoursEditor({ initial }: { initial: HourEntry[] }) {
  const [hours, setHours] = useState<HourEntry[]>(initial);
  const [saving, setSaving] = useState(false);

  function patchDay(day: string, patch: Partial<HourEntry>) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await shopApi.updateHours(hours);
      setHours(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {hours.map((h) => (
        <div key={h.day} className="flex items-center gap-4">
          <span className="w-28">{h.day}</span>
          <input type="checkbox" checked={h.isOpen} onChange={(e) => patchDay(h.day, { isOpen: e.target.checked })} />
          <input type="time" value={h.openTime} disabled={!h.isOpen} onChange={(e) => patchDay(h.day, { openTime: e.target.value })} />
          <span>–</span>
          <input type="time" value={h.closeTime} disabled={!h.isOpen} onChange={(e) => patchDay(h.day, { closeTime: e.target.value })} />
        </div>
      ))}
      <button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Hours'}</button>
    </div>
  );
}
```

---

### Dashboard — Update Location

```tsx
async function handleLocationSave(formData: Partial<ShopLocation>) {
  try {
    const updated = await shopApi.updateLocation(formData);
    setLocation(updated);
  } catch (err: any) {
    const { message } = err.response?.data?.error ?? {};
    setError(message ?? 'Failed to update location.');
  }
}

// mapEmbedUrl must start with https://www.google.com/maps/embed
// Get it from: Google Maps → Share → Embed a map → copy the src URL
```

---

### Dashboard — Manage Artisans

```tsx
async function handleAddArtisan(data: Omit<Artisan, 'id'>) {
  const created = await shopApi.createArtisan(data);
  setArtisans((prev) => [...prev, created]);
}

async function handleDeactivate(id: string) {
  const updated = await shopApi.updateArtisan(id, { isActive: false });
  setArtisans((prev) => prev.map((a) => (a.id === id ? updated : a)));
}

async function handleRemove(id: string) {
  await shopApi.deleteArtisan(id);
  setArtisans((prev) => prev.filter((a) => a.id !== id));
}
```

---

### Dashboard — Feature a Review

```tsx
async function handleToggleFeatured(review: Review) {
  const updated = await shopApi.setReviewFeatured(review.id, !review.isFeatured);
  setReviews((prev) => prev.map((r) => (r.id === review.id ? updated : r)));
}
```

---

## Error Handling

All errors follow this shape:

```ts
{
  error: {
    code: string;     // see table below
    message: string;  // safe to display directly
  }
}
```

| Code | HTTP | When |
|------|------|------|
| `NOT_FOUND` | 404 | slug or resource ID doesn't exist |
| `SHOP_NOT_FOUND` | 404 | slug doesn't match any shop |
| `FORBIDDEN` | 403 | resource belongs to a different tenant |
| `UNAUTHORIZED` | 401 | missing or expired access token |
| `VALIDATION_ERROR` | 422 | missing/invalid field — check `error.message` for the specific issue |

```ts
// Generic error handler for any shop API call
async function callShopApi<T>(fn: () => Promise<T>, setError: (msg: string) => void): Promise<T | null> {
  try {
    return await fn();
  } catch (err: any) {
    const { code, message } = err.response?.data?.error ?? {};
    if (code === 'UNAUTHORIZED') {
      // handled by axios interceptor — redirects to login
    } else {
      setError(message ?? 'Something went wrong. Please try again.');
    }
    return null;
  }
}

// Usage:
const updated = await callShopApi(() => shopApi.updateProfile(data), setError);
```

---

## Notes

**`rating` and `reviewCount`** are computed from all reviews submitted for the shop. They update automatically as reviews are added.

**`mapEmbedUrl`** must start with `https://www.google.com/maps/embed`. To get it:
1. Open Google Maps → find your location
2. Click Share → Embed a map
3. Copy the `src="..."` value from the `<iframe>` tag

**Treatment `status`** uses `"Active"` / `"Inactive"` (capitalized). Only show `"Active"` treatments on the public booking page.

**Hours** — always send all 7 days when calling `PUT /shops/hours`. Days with `isOpen: false` still require `openTime` and `closeTime` values (they're stored but ignored in display).

**Artisan ownership** — DELETE and PUT on artisans/treatments will return `404` if the ID belongs to a different shop. The server enforces tenant isolation from the JWT — no client-side check needed.
