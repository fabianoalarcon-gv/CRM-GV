export interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Captação", href: "/captacao", icon: "add_business" },
  { label: "Leads", href: "/leads", icon: "person_search" },
  { label: "Pipeline", href: "/pipeline", icon: "view_kanban" },
  { label: "Empresas", href: "/empresas", icon: "group" },
  { label: "Calendário", href: "/calendario", icon: "calendar_today" },
  { label: "Tutorial", href: "/tutorial", icon: "menu_book" },
];

export const adminNavItems: NavItem[] = [
  { label: "Usuários", href: "/usuarios", icon: "admin_panel_settings", adminOnly: true },
  { label: "Parâmetros", href: "/parametros", icon: "tune", adminOnly: true },
  { label: "Atualizações", href: "/atualizacoes", icon: "system_update", adminOnly: true },
];
