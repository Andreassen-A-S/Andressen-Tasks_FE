export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  TERMINATED = "TERMINATED",
}

export const UserPositions = ["Håndmand", "CEO", "Maskinfører", "Revisor"];

export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "Super Administrator";
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
  position: string;
  role: UserRole;
  status: UserStatus;
  organization_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  position?: string;
  role?: UserRole;
  password?: string;
  status?: UserStatus;
}

export interface CreateUserInput {
  name: string;
  email: string;
  position: string;
  role: UserRole;
  password: string;
  organization_id?: string;
}
