export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export type UserRole = 'user' | 'admin';

export type AdminUser = {
  id: number;
  email: string;
  name?: string | null;
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: UserRole | string;
  isAdmin?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthUser = AdminUser & {
  role: UserRole | string;
};

export type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
};

export type ProductType = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Sample = {
  id: number;
  productTypeId: number;
  productType?: ProductType;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
};
