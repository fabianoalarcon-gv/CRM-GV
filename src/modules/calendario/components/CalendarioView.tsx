"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createCompromisso } from "../actions";
import type { ClienteOption, Compromisso, CompromissoInput } from "../types";
import { addDays, addMonths, getMonthGrid, isSameDay, startOfWeek, toDatetimeLocalValue } from "../utils";
import { CompromissoDetailModal } from "./CompromissoDetailModal";
import { CompromissoForm } from "./CompromissoForm";

type ViewMode = "mes" | "semana" | "dia";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "mes", label: "Mês" },
  { value: "semana", label: "Semana" },
  { value: "dia", label: "Dia" },
];

const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  weekday: "long",
});
const weekDayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" });
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
    cliente_id: null,
  };
}

export interface CalendarioViewProps {
  compromissos: Compromisso[];
  clientes: ClienteOption[];
}

export function CalendarioView({ compromissos, clientes }: CalendarioViewProps) {
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
        <Button type="button" onClick={() => openCreateFor(currentDate)}>
          + Novo compromisso
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goPrev} aria-label="Anterior">
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={goNext} aria-label="Próximo">
            →
          </Button>
          <span className="ml-2 text-sm font-medium text-foreground capitalize">{headerLabel}</span>
        </div>

        <div className="flex gap-1 rounded-lg border border-border p-1">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setViewMode(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === option.value
                  ? "bg-brand-navy text-white dark:bg-brand-accent dark:text-brand-navy"
                  : "text-brand-graphite-light hover:bg-black/[.04] dark:hover:bg-white/[.06]"
              }`}
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
        <WeekView
          currentDate={currentDate}
          compromissosOn={compromissosOn}
          onSelect={setSelected}
          onCreate={openCreateFor}
        />
      )}
      {viewMode === "dia" && (
        <DayView
          currentDate={currentDate}
          compromissosOn={compromissosOn}
          onSelect={setSelected}
          onCreate={openCreateFor}
        />
      )}

      <Modal
        isOpen={createDefaults !== null}
        onClose={() => setCreateDefaults(null)}
        title="Novo compromisso"
        className="max-w-lg"
      >
        {createDefaults && (
          <CompromissoForm
            clientes={clientes}
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
          clientes={clientes}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
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
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="bg-black/[.02] p-2 text-center text-xs font-medium text-brand-graphite-light dark:bg-white/[.03]"
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
            onClick={() => (dayCompromissos.length > 0 ? onSelect(dayCompromissos[0]) : onCreate(day))}
            className={`flex min-h-24 flex-col gap-1 bg-surface p-1.5 text-left align-top hover:bg-black/[.02] dark:hover:bg-white/[.03] ${
              inCurrentMonth ? "" : "opacity-40"
            }`}
          >
            <span
              className={`text-xs font-medium ${
                isSameDay(day, today)
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-white"
                  : "text-brand-graphite-light"
              }`}
            >
              {day.getDate()}
            </span>
            <div className="flex flex-col gap-0.5">
              {dayCompromissos.slice(0, 3).map((c) => (
                <span
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(c);
                  }}
                  className="truncate rounded bg-brand-accent/15 px-1 py-0.5 text-[11px] text-brand-navy dark:text-brand-accent"
                >
                  {timeFormatter.format(new Date(c.inicio))} {c.titulo}
                </span>
              ))}
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

function WeekView({ currentDate, compromissosOn, onSelect, onCreate }: DayListProps) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);
  const today = new Date();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const dayCompromissos = compromissosOn(day);
        return (
          <div
            key={day.toISOString()}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium capitalize ${
                  isSameDay(day, today) ? "text-brand-accent" : "text-foreground"
                }`}
              >
                {weekDayFormatter.format(day)}
              </span>
              <button
                type="button"
                onClick={() => onCreate(day)}
                className="text-xs text-brand-graphite-light hover:text-brand-accent"
                aria-label="Novo compromisso"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {dayCompromissos.length === 0 && (
                <p className="text-xs text-brand-graphite-light">Sem compromissos</p>
              )}
              {dayCompromissos.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c)}
                  className="rounded bg-brand-accent/15 px-2 py-1 text-left text-xs text-brand-navy dark:text-brand-accent"
                >
                  <span className="font-medium">{timeFormatter.format(new Date(c.inicio))}</span>{" "}
                  {c.titulo}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ currentDate, compromissosOn, onSelect }: DayListProps) {
  const dayCompromissos = compromissosOn(currentDate).sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
  );

  return (
    <div className="flex flex-col gap-3">
      {dayCompromissos.length === 0 && (
        <p className="text-sm text-brand-graphite-light">Nenhum compromisso neste dia.</p>
      )}
      {dayCompromissos.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c)}
          className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-4 text-left hover:bg-black/[.02] dark:hover:bg-white/[.03]"
        >
          <div>
            <p className="font-medium text-foreground">{c.titulo}</p>
            {c.cliente_nome && (
              <Badge variant="info" className="mt-1">
                {c.cliente_nome}
              </Badge>
            )}
            {c.descricao && <p className="mt-2 text-sm text-brand-graphite-light">{c.descricao}</p>}
          </div>
          <span className="shrink-0 text-sm text-brand-graphite-light">
            {timeFormatter.format(new Date(c.inicio))}
            {c.fim && ` – ${timeFormatter.format(new Date(c.fim))}`}
          </span>
        </button>
      ))}
    </div>
  );
}
