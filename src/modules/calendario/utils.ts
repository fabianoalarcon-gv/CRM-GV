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
];

export const TIPO_LABEL: Record<CompromissoTipo, string> = Object.fromEntries(
  TIPO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<CompromissoTipo, string>;

// Cor por categoria (validada com a skill dataviz — ver globals.css).
export const TIPO_COLOR: Record<CompromissoTipo, string> = {
  fretes: "var(--color-brand-accent)",
  reuniao: "var(--color-cal-reuniao)",
  urgente: "var(--color-temp-quente)",
  embarque: "var(--color-cal-embarque)",
  outro: "var(--color-brand-graphite-light)",
};

export function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
