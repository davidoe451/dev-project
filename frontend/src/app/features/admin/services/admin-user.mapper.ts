import type { AdminUser } from './admin.service';

export interface AdminUserApi {
  id: string | number;
  email: string;
  fullName?: string | null;
  full_name?: string | null;
  phone?: string | null;
  isActive?: boolean;
  status?: AdminUser['status'];
  roleId?: string | number;
  role?: { id: string | number; code: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export function mapAdminUser(user: AdminUserApi): AdminUser {
  return {
    id: String(user.id),
    email: user.email,
    fullName: user.fullName ?? user.full_name ?? null,
    phone: user.phone ?? null,
    status: user.status ?? (user.isActive ? 'ACTIVE' : 'INACTIVE'),
    roleId: user.roleId === undefined ? undefined : String(user.roleId),
    role: user.role ? { ...user.role, id: String(user.role.id) } : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
