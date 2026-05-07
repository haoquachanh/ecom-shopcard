export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}
