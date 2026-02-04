export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface User {
  user_id: string;
  name?: string;
  email: string;
  position?: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}
