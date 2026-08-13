"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { createCompromisso } from "../actions";
import type { EmpresaOption, Compromisso, CompromissoInput } from "../types";
import {
  TIPO_COLOR,
  TIPO_LABEL,
  TIPO_OPTIONS,
  addDays,
  addMonths,
  getMonthGrid,
  isSameDay,
  startOfWeek,
  toDatetimeLocalValue,
} from "../utils";
import { CompromissoDetailModal } from "./CompromissoDetailModal";
import { CompromissoForm } from "./CompromissoForm";

type ViewMode = "mes" | "semana" | "dia";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "mes", label: "Mês" },
  { value: "semana", label: "Semana" },
  { value: "dia", label: "Dia" },
];

const HOUR_HEIGHT = 56;
const GRID_START_HOUR = 7;
const GRID_END_HOUR = 20;
const HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);

const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  weekday: "long",
});
const weekDayShortFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function emptyValues(date: Date): CompromissoInput {
  const withDefaultHour = new Date(date);
  if (withDefaultHour.getHours() === 0 && withDefaultHour.getMinutes() === 0) {
    withDefaultHour.setHours(9, 0, 0, 0);
  }
  return {
    titulo: "",
    descricao: "",
    inicio: toDatetimeLocalValue(withDefaultHour),
    fim: "",
    tipo: "outro",
    empresa_id: null,
  };
}

function tipoColor(compromisso: Compromisso): string {
  return compromisso.tipo ? TIPO_COLOR[compromisso.tipo] : "var(--color-brand-accent)";
}

export interface CalendarioViewProps {
  compromissos: Compromisso[];
  empresas: EmpresaOption[];
}

export function CalendarioView({ compromissos, empresas }: CalendarioViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("mes");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selected, setSelected] = useState<Compromisso | null>(null);
  const [createDefaults, setCreateDefaults] = useState<CompromissoInput | null>(null);

  const compromissosByDay = useMemo(() => {
    const map = new Map<string, Compromisso[]>();
    for (const c of compromissos) {
      const key = new Date(c.inicio).toDateString();
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [compromissos]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  function compromissosOn(date: Date): Compromisso[] {
    return compromissosByDay.get(date.toDateString()) ?? [];
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  function goPrev() {
    if (viewMode === "mes") setCurrentDate((d) => addMonths(d, -1));
    else if (viewMode === "semana") setCurrentDate((d) => addDays(d, -7));
    else setCurrentDate((d) => addDays(d, -1));
  }

  function goNext() {
    if (viewMode === "mes") setCurrentDate((d) => addMonths(d, 1));
    else if (viewMode === "semana") setCurrentDate((d) => addDays(d, 7));
    else setCurrentDate((d) => addDays(d, 1));
  }

  function openCreateFor(date: Date) {
    setCreateDefaults(emptyValues(date));
  }

  const headerLabel =
    viewMode === "dia" ? dayLabelFormatter.format(currentDate) : monthLabelFormatter.format(currentDate);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Calendário
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Compromissos
          </h1>
        </div>
        <Button type="button" onClick={() => openCreateFor(currentDate)} className="gap-1.5">
          <Icon name="add" size={18} />
          Novo compromisso
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Anterior"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-brand-graphite-light hover:bg-black/[.03]"
          >
            <Icon name="chevron_left" />
          </button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Hoje
          </Button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-brand-graphite-light hover:bg-black/[.03]"
          >
            <Icon name="chevron_right" />
          </button>
          <span className="ml-2 text-sm font-medium text-foreground capitalize">{headerLabel}</span>
        </div>

        <div className="flex gap-1 rounded-lg border border-border bg-black/[.02] p-1">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setViewMode(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === option.value
                  ? "bg-surface text-brand-accent shadow-sm"
                  : "text-brand-graphite-light hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "mes" && (
        <MonthView
          currentDate={currentDate}
          compromissosOn={compromissosOn}
          onSelect={setSelected}
          onCreate={openCreateFor}
        />
      )}
      {viewMode === "semana" && (
        <>
          <HourGrid
            days={weekDays}
            compromissosOn={compromissosOn}
            onSelect={setSelected}
            onCreate={openCreateFor}
          />
          <Legend />
        </>
      )}
      {viewMode === "dia" && (
        <>
          <HourGrid
            days={[currentDate]}
            compromissosOn={compromissosOn}
            onSelect={setSelected}
            onCreate={openCreateFor}
          />
          <Legend />
        </>
      )}

      <Modal
        isOpen={createDefaults !== null}
        onClose={() => setCreateDefaults(null)}
        title="Novo compromisso"
        className="max-w-lg"
      >
        {createDefaults && (
          <CompromissoForm
            empresas={empresas}
            initialValues={createDefaults}
            submitLabel="Criar compromisso"
            onSubmit={createCompromisso}
            onSuccess={() => setCreateDefaults(null)}
            onCancel={() => setCreateDefaults(null)}
          />
        )}
      </Modal>

      {selected && (
        <CompromissoDetailModal
          compromisso={selected}
          empresas={empresas}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 px-1">
      {TIPO_OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: TIPO_COLOR[option.value] }}
          />
          <span className="text-xs text-brand-graphite-light">{option.label}</span>
        </div>
      ))}
    </div>
  );
}

interface DayListProps {
  currentDate: Date;
  compromissosOn: (date: Date) => Compromisso[];
  onSelect: (c: Compromisso) => void;
  onCreate: (date: Date) => void;
}

function MonthView({ currentDate, compromissosOn, onSelect, onCreate }: DayListProps) {
  const days = useMemo(() => getMonthGrid(currentDate), [currentDate]);
  const today = new Date();

  return (
    <div className="grid shrink-0 grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="bg-black/[.02] p-2 text-center text-xs font-medium text-brand-graphite-light"
        >
          {label}
        </div>
      ))}
      {days.map((day) => {
        const dayCompromissos = compromissosOn(day);
        const inCurrentMonth = day.getMonth() === currentDate.getMonth();
        return (
          <button
            key={day.toISOString()}
            type="button"
            // Clicar no fundo da célula sempre cria um novo compromisso, mesmo
            // que o dia já tenha outros — cada chip de evento já tem seu
            // próprio onClick (com stopPropagation) pra abrir o existente.
            onClick={() => onCreate(day)}
            className={cn(
              "flex min-h-24 flex-col gap-1 bg-surface p-1.5 text-left align-top hover:bg-black/[.02]",
              !inCurrentMonth && "opacity-40",
            )}
          >
            <span
              className={cn(
                "text-xs font-medium",
                isSameDay(day, today)
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-white"
                  : "text-brand-graphite-light",
              )}
            >
              {day.getDate()}
            </span>
            <div className="flex flex-col gap-0.5">
              {dayCompromissos.slice(0, 3).map((c) => {
                const color = tipoColor(c);
                return (
                  <span
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(c);
                    }}
                    className="truncate rounded px-1 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                      color,
                    }}
                  >
                    {timeFormatter.format(new Date(c.inicio))} {c.titulo}
                  </span>
                );
              })}
              {dayCompromissos.length > 3 && (
                <span className="text-[11px] text-brand-graphite-light">
                  +{dayCompromissos.length - 3} mais
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface HourGridProps {
  days: Date[];
  compromissosOn: (date: Date) => Compromisso[];
  onSelect: (c: Compromisso) => void;
  onCreate: (date: Date) => void;
}

interface Placement {
  item: Compromisso;
  col: number;
  cols: number;
}

function layoutColumns(items: Compromisso[]): Placement[] {
  const sorted = [...items].sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
  );
  const colEndTimes: number[] = [];
  const placements: { item: Compromisso; col: number }[] = [];

  for (const item of sorted) {
    const start = new Date(item.inicio).getTime();
    const end = item.fim ? new Date(item.fim).getTime() : start + 60 * 60 * 1000;
    let col = colEndTimes.findIndex((endTime) => endTime <= start);
    if (col === -1) {
      col = colEndTimes.length;
      colEndTimes.push(end);
    } else {
      colEndTimes[col] = end;
    }
    placements.push({ item, col });
  }

  const cols = Math.max(1, colEndTimes.length);
  return placements.map((p) => ({ ...p, cols }));
}

function getEventPosition(compromisso: Compromisso): { top: number; height: number } {
  const start = new Date(compromisso.inicio);
  const end = compromisso.fim ? new Date(compromisso.fim) : new Date(start.getTime() + 60 * 60 * 1000);
  const startHour = start.getHours() + start.getMinutes() / 60;
  const endHour = Math.max(startHour + 0.25, end.getHours() + end.getMinutes() / 60);
  const top = Math.max(0, (startHour - GRID_START_HOUR) * HOUR_HEIGHT);
  const height = Math.max(26, (endHour - startHour) * HOUR_HEIGHT);
  return { top, height };
}

function HourGrid({ days, compromissosOn, onSelect, onCreate }: HourGridProps) {
  const now = new Date();
  const gridHeight = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {days.length > 1 && (
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          {days.map((day) => {
            const isToday = isSameDay(day, now);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-1 border-l border-border py-2 text-center",
                  isToday && "bg-brand-accent/5",
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-medium tracking-wide uppercase",
                    isToday ? "text-brand-accent" : "text-brand-graphite-light",
                  )}
                >
                  {weekDayShortFormatter.format(day)}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold",
                    isToday ? "text-brand-accent" : "text-foreground",
                  )}
                >
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex overflow-y-auto" style={{ maxHeight: 560 }}>
        <div className="w-14 shrink-0 border-r border-border">
          {HOURS.map((h) => (
            <div
              key={h}
              style={{ height: HOUR_HEIGHT }}
              className="border-b border-border/60 pt-1 pr-2 text-right font-mono text-[11px] text-brand-graphite-light"
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {days.map((day) => {
          const items = compromissosOn(day);
          const placements = layoutColumns(items);
          const isToday = isSameDay(day, now);
          const nowOffset = isToday
            ? (now.getHours() + now.getMinutes() / 60 - GRID_START_HOUR) * HOUR_HEIGHT
            : null;

          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onCreate(day)}
              className="relative flex-1 border-l border-border"
              style={{ height: gridHeight }}
            >
              {HOURS.map((h) => (
                <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-border/60" />
              ))}

              {nowOffset !== null && nowOffset >= 0 && nowOffset <= gridHeight && (
                <div
                  aria-hidden
                  className="absolute right-0 left-0 z-20 h-px bg-temp-quente"
                  style={{ top: nowOffset }}
                >
                  <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-temp-quente" />
                </div>
              )}

              {placements.map(({ item, col, cols }) => {
                const { top, height } = getEventPosition(item);
                const color = tipoColor(item);
                const widthPct = 100 / cols;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(item);
                    }}
                    className="absolute z-10 overflow-hidden rounded-md border-l-[3px] p-1.5 text-left shadow-sm transition-shadow hover:shadow-md"
                    style={{
                      top,
                      height,
                      left: `calc(${col * widthPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      backgroundColor: `color-mix(in srgb, ${color} 12%, white)`,
                      borderLeftColor: color,
                    }}
                  >
                    <p className="truncate text-[11px] font-semibold text-foreground">{item.titulo}</p>
                    <p className="truncate text-[10px] text-brand-graphite-light">
                      {timeFormatter.format(new Date(item.inicio))}
                      {item.tipo && ` · ${TIPO_LABEL[item.tipo]}`}
                    </p>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
