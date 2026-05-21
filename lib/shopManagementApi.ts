import { api } from './api';

export interface ShopProfile {
  id: string;
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
  price: number;
  duration: number;
  status: 'Active' | 'Inactive';
}

export interface DayHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
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
  rating: number;
  comment: string;
  createdAt: string;
  isFeatured: boolean;
}

// ─── Public reads (no auth) ──────────────────────────────────────────────────

export const fetchShopProfile = (slug: string) =>
  api.get<ShopProfile>(`/shops/${slug}/profile`).then(r => r.data);

export const fetchTreatments = (slug: string) =>
  api.get<{ treatments: Treatment[] }>(`/shops/${slug}/treatments`).then(r => r.data.treatments);

export const fetchShopHours = (slug: string) =>
  api.get<{ hours: DayHours[] }>(`/shops/${slug}/hours`).then(r => r.data.hours);

export const fetchShopLocation = (slug: string) =>
  api.get<ShopLocation>(`/shops/${slug}/location`).then(r => r.data);

export const fetchArtisans = (slug: string) =>
  api.get<{ artisans: Artisan[] }>(`/shops/${slug}/artisans`).then(r => r.data.artisans);

export const fetchReviews = (slug: string) =>
  api.get<{ reviews: Review[] }>(`/shops/${slug}/reviews`).then(r => r.data.reviews);

// ─── Shop appointments (barber view) ─────────────────────────────────────────

export interface ShopAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  treatmentName: string;
  treatmentPrice: number;
  artisanName: string | null;
  appointmentDate: string;  // YYYY-MM-DD
  appointmentTime: string;  // HH:mm
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
}

export const fetchShopAppointments = (params?: { status?: string; date?: string }) =>
  api
    .get<{ appointments: ShopAppointment[] }>('/shops/appointments', { params })
    .then((r) => r.data.appointments);

export const updateShopAppointmentStatus = (
  id: string,
  status: ShopAppointment['status'],
) =>
  api
    .patch<ShopAppointment>(`/shops/appointments/${id}/status`, { status })
    .then((r) => r.data);

// ─── Authenticated management ─────────────────────────────────────────────────

export const updateShopProfile = (payload: Partial<Pick<ShopProfile, 'name' | 'description' | 'phone' | 'email' | 'ownerName' | 'bannerUrl'>>) =>
  api.put<ShopProfile>('/shops/profile', payload).then(r => r.data);

export const createTreatment = (payload: Omit<Treatment, 'id'>) =>
  api.post<Treatment>('/shops/treatments', payload).then(r => r.data);

export const updateTreatment = (id: string, payload: Partial<Omit<Treatment, 'id'>>) =>
  api.put<Treatment>(`/shops/treatments/${id}`, payload).then(r => r.data);

export const deleteTreatment = (id: string) =>
  api.delete(`/shops/treatments/${id}`);

export const updateShopHours = (hours: DayHours[]) =>
  api.put<{ hours: DayHours[] }>('/shops/hours', { hours }).then(r => r.data.hours);

export const updateShopLocation = (payload: ShopLocation) =>
  api.put<ShopLocation>('/shops/location', payload).then(r => r.data);

export const createArtisan = (payload: Omit<Artisan, 'id'>) =>
  api.post<Artisan>('/shops/artisans', payload).then(r => r.data);

export const updateArtisan = (id: string, payload: Partial<Omit<Artisan, 'id'>>) =>
  api.put<Artisan>(`/shops/artisans/${id}`, payload).then(r => r.data);

export const deleteArtisan = (id: string) =>
  api.delete(`/shops/artisans/${id}`);

export const toggleReviewFeatured = (id: string, isFeatured: boolean) =>
  api.patch<Review>(`/shops/reviews/${id}`, { isFeatured }).then(r => r.data);
