// Mesmos ícones usados no menu lateral (nav-items.tsx) pros módulos que têm
// item de menu próprio; login/notificações/atualizações não têm entrada no
// menu, então ganham um ícone equivalente só pra esta tela.
export const TUTORIAL_MODULE_ICON: Record<string, string> = {
  login: "lock",
  captacao: "add_business",
  leads: "person_search",
  pipeline: "view_kanban",
  empresas: "group",
  dashboard: "dashboard",
  calendario: "calendar_today",
  notificacoes: "notifications",
  atualizacoes: "system_update",
  usuarios: "admin_panel_settings",
  parametros: "tune",
};

export const DEFAULT_MODULE_ICON = "menu_book";
