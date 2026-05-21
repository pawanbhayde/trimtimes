import { api } from './api';
import type { CustomerUser } from './types';

export interface UserLoginResponse {
  accessToken: string;
  expiresIn: number;
  user: CustomerUser;
}

export interface UserRegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserRegisterResponse {
  accessToken: string;
  expiresIn: number;
  user: CustomerUser;
}

export async function userLogin(
  email: string,
  password: string,
): Promise<UserLoginResponse> {
  const { data } = await api.post<UserLoginResponse>('/users/login', {
    email,
    password,
  });
  return data;
}

export async function userRegister(
  payload: UserRegisterPayload,
): Promise<UserRegisterResponse> {
  const { data } = await api.post<UserRegisterResponse>(
    '/users/register',
    payload,
  );
  return data;
}
