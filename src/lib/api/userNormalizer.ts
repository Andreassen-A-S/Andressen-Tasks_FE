import { UserStatus, type User, type PositionSummary } from "@/types/users";

type ApiUser = {
  user_id: string;
  email: string;
  role: User["role"];
  name: string;
  organization_id: string;
  organization?: { name: string } | null;
  position_id?: string | null;
  position?: PositionSummary | null;
  status?: User["status"];
  profile_picture_url?: string | null;
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
    organization: user.organization ?? null,
    status: user.status ?? UserStatus.ACTIVE,
    profile_picture_url: user.profile_picture_url ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
