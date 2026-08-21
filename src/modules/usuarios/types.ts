import type { Role } from "@/lib/auth/types";

export interface Usuario {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  google_calendar_sync: boolean;
  email_notifications: boolean;
  created_at: string;
}

export interface InviteUsuarioInput {
  email: string;
  full_name: string;
  role: Role;
  password: string;
  google_calendar_sync: boolean;
  email_notifications: boolean;
}

export interface UpdateUsuarioInput {
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  password: string;
  google_calendar_sync: boolean;
  email_notifications: boolean;
}
