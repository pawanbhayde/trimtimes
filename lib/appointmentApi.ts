import { api } from './api';

export interface BookingPayload {
  tenantSlug: string;
  treatmentId: string;
  artisanId?: string | null;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  notes?: string;
}

export interface BookingResponse {
  id: string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string | null;
  treatment: { name: string; duration: number; price: number };
  artisan: { name: string } | null;
}

export interface MyAppointment {
  id: string;
  shopName: string;
  shopSlug: string;
  treatment: { name: string; duration: number; price: number };
  artisan: { name: string } | null;
  appointmentDate: string;
  appointmentTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
}

export const bookAppointment = (payload: BookingPayload) =>
  api.post<BookingResponse>('/appointments', payload).then((r) => r.data);

export const getMyAppointments = (tenantSlug?: string) =>
  api
    .get<{ appointments: MyAppointment[] }>('/appointments/my', {
      params: tenantSlug ? { tenant: tenantSlug } : undefined,
    })
    .then((r) => r.data.appointments);

export const cancelAppointment = (id: string) =>
  api.delete(`/appointments/${id}`);
