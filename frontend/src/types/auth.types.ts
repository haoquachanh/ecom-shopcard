export interface AuthUser {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
