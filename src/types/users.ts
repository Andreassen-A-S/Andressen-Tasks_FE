export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export const UserPositions = ["Håndmand", "CEO", "Maskinfører", "Revisor"];

export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrator";
    case UserRole.USER:
      return "Bruger";
    default:
      return "Ukendt rolle";
  }
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  position: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  position?: string;
  role?: UserRole;
  password?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  position: string;
  role: UserRole;
  password: string;
}
