export interface ShopListItem {
  id: string;
  name: string;
  ownerName: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  schemaName: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface BarberUser {
  id: string;
  name: string;
  email: string;
  role: 'barber';
}

export interface CustomerUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer';
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export type AnyUser = BarberUser | CustomerUser | AdminUser | null;

export interface ApiError {
  error: {
    code: string;
    message: string;
    field: string | null;
  };
}
