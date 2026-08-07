export type Role = "admin" | "comercial" | "operacoes" | "financeiro";

export interface CurrentUser {
  id: string;
  fullName: string;
  role: Role;
}
