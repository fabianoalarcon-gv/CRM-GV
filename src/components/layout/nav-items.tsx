export interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Pipeline Comercial", href: "/pipeline", icon: "view_kanban" },
  { label: "Clientes", href: "/clientes", icon: "group" },
  { label: "Calendário", href: "/calendario", icon: "calendar_today" },
];

export const adminNavItems: NavItem[] = [
  { label: "Usuários", href: "/usuarios", icon: "admin_panel_settings", adminOnly: true },
];
