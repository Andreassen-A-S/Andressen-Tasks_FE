import type { PositionSummary } from "./position";

export type { PositionSummary };

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  TERMINATED = "TERMINATED",
}

export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "Superadministrator";
    case UserRole.ADMIN:
      return "Administrator";
    case UserRole.USER:
      return "Bruger";
    default:
      return "Ukendt rolle";
  }
}

export function isAdminRole(role?: UserRole | null): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  position_id: string | null;
  position: PositionSummary | null;
  role: UserRole;
  status: UserStatus;
  organization_id: string;
  organization?: { name: string } | null;
  profile_picture_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  position_id?: string | null;
  role?: UserRole;
  password?: string;
  status?: UserStatus;
  profile_picture_url?: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  position_id?: string;
  role: UserRole;
  password: string;
  organization_id?: string;
}

export interface MentionableUser {
  user_id: string;
  name: string;
  profile_picture_url?: string | null;
}
