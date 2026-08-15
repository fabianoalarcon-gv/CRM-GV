import type { CompromissoTipo } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export const TIPO_OPTIONS: { value: CompromissoTipo; label: string }[] = [
  { value: "fretes", label: "Fretes Regulares" },
  { value: "reuniao", label: "Reuniões" },
  { value: "urgente", label: "Urgente" },
  { value: "embarque", label: "Embarques" },
  { value: "outro", label: "Outro" },
  { value: "ligacao", label: "Ligação" },
  { value: "email", label: "E-mail" },
  { value: "visita", label: "Visita" },
  { value: "follow_up", label: "Follow-Up" },
];

// Categorias atualmente em uso — as demais (fretes, urgente, embarque) só
// existem em compromissos antigos e continuam sendo exibidas corretamente
// (TIPO_LABEL/TIPO_COLOR cobrem todo CompromissoTipo), mas não aparecem mais
// pra seleção em formulários novos nem na legenda do Calendário.
export const ACAO_TIPO_OPTIONS: { value: CompromissoTipo; label: string }[] = [
  { value: "reuniao", label: "Reunião" },
  { value: "ligacao", label: "Ligação" },
  { value: "email", label: "E-mail" },
  { value: "visita", label: "Visita" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "outro", label: "Outro" },
];

export const TIPO_LABEL: Record<CompromissoTipo, string> = Object.fromEntries(
  TIPO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<CompromissoTipo, string>;

// Cor por categoria (validada com a skill dataviz — ver globals.css). Ordem
// fixa (mesma de CompromissoTipo/TIPO_OPTIONS) — não reordenar sem revalidar.
export const TIPO_COLOR: Record<CompromissoTipo, string> = {
  fretes: "var(--color-brand-accent)",
  reuniao: "var(--color-cal-reuniao)",
  urgente: "var(--color-temp-quente)",
  embarque: "var(--color-cal-embarque)",
  outro: "var(--color-brand-graphite-light)",
  ligacao: "var(--color-cal-ligacao)",
  email: "var(--color-cal-email)",
  visita: "var(--color-cal-visita)",
  follow_up: "var(--color-cal-followup)",
};

export function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Compara só a data (ignora hora) — usado pra travar exclusão de Ações que
// já aconteceram (dia de hoje ainda conta como "não passado").
export function isBeforeToday(dateIso: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateIso);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function getMonthGrid(date: Date): Date[] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
