export interface Role {
  id: number;
  code: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  isActive: boolean;
  roleId: number;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  id: number;
  email: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

