import { UserStatus, type User, type UserPosition } from "@/types/users";

type ApiUser = {
  user_id: string;
  email: string;
  role: User["role"];
  name: string;
  organization_id: string;
  position_id?: string | null;
  position?: UserPosition | null;
  status?: User["status"];
  created_at?: string;
  updated_at?: string;
};

export function normalizeUser(user: ApiUser): User {
  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    position_id: user.position_id ?? null,
    position: user.position ?? null,
    organization_id: user.organization_id,
    status: user.status ?? UserStatus.ACTIVE,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
