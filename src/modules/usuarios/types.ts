import type { Role } from "@/lib/auth/types";

export interface Usuario {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface InviteUsuarioInput {
  email: string;
  full_name: string;
  role: Role;
  password: string;
}

export interface UpdateUsuarioInput {
  full_name: string;
  role: Role;
  is_active: boolean;
}
