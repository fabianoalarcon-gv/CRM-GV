"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { SEGMENTO_OPTIONS, type Proposta, type Segmento, type Termometro } from "@/modules/pipeline/types";
import { updateLeadSegmento, updateLeadTermometro } from "../actions";
import { LeadDetailModal } from "./LeadDetailModal";

const TERMOMETRO_OPTIONS: { value: Termometro; label: string }[] = [
  { value: "frio", label: "Frio" },
  { value: "morno", label: "Morno" },
  { value: "quente", label: "Quente" },
];

const TERMOMETRO_SELECT_CLASS: Record<Termometro, string> = {
  frio: "bg-temp-frio/15 text-sky-700",
  morno: "bg-temp-morno/20 text-yellow-800",
  quente: "bg-temp-quente/15 text-temp-quente",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function daysAgoLabel(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return days === 0 ? "hoje" : `${days}d`;
}

export function LeadCard({ proposta }: { proposta: Proposta }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(proposta.id),
  });
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [termometro, setTermometro] = useState(proposta.termometro);
  const [isSavingTermometro, setIsSavingTermometro] = useState(false);
  async function handleTermometroChange(next: Termometro) {
    const previous = termometro;
    setTermometro(next);
    setIsSavingTermometro(true);
    const result = await updateLeadTermometro(proposta.id, next);
    setIsSavingTermometro(false);
    if (result.error) setTermometro(previous);
  }

  const [segmento, setSegmento] = useState(proposta.segmento);
  const [isSavingSegmento, setIsSavingSegmento] = useState(false);
  async function handleSegmentoChange(next: Segmento | null) {
    const previous = segmento;
    setSegmento(next);
    setIsSavingSegmento(true);
    const result = await updateLeadSegmento(proposta.id, next);
    setIsSavingSegmento(false);
    if (result.error) setSegmento(previous);
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={transform ? { transform: CSS.Translate.toString(transform) } : undefined}
        {...listeners}
        {...attributes}
        onClick={() => setIsDetailOpen(true)}
        className={cn(
          "touch-none cursor-grab select-none active:cursor-grabbing",
          isDragging && "opacity-50",
        )}
      >
        <CardContent className="flex flex-col gap-2 p-3">
          <span className="font-mono text-xs text-brand-graphite-light">{proposta.numero_lead}</span>

          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={termometro}
              disabled={isSavingTermometro}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => handleTermometroChange(e.target.value as Termometro)}
              className={cn(
                "h-6 cursor-pointer rounded-md border-0 pr-6 pl-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
                TERMOMETRO_SELECT_CLASS[termometro],
              )}
            >
              {TERMOMETRO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={segmento ?? ""}
              disabled={isSavingSegmento}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => handleSegmentoChange((e.target.value || null) as Segmento | null)}
              className="h-6 cursor-pointer rounded-md border-0 bg-black/[.05] pr-6 pl-2 text-[11px] font-medium text-brand-graphite-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <option value="">Segmento…</option>
              {SEGMENTO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">{proposta.cliente_nome}</p>
            {proposta.cliente_setor && (
              <p className="text-xs text-brand-graphite-light">{proposta.cliente_setor}</p>
            )}
          </div>

          {proposta.descricao && (
            <p className="line-clamp-2 text-xs text-brand-graphite-light">{proposta.descricao}</p>
          )}

          <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
            <span
              className="flex items-center gap-0.5 text-[11px] text-brand-graphite-light"
              title={`Criado há ${daysAgoLabel(proposta.created_at)}`}
            >
              <Icon name="schedule" size={13} />
              {daysAgoLabel(proposta.created_at)}
            </span>
            {proposta.valor != null && (
              <span className="font-mono text-sm font-semibold text-foreground">
                {currencyFormatter.format(proposta.valor)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <LeadDetailModal proposta={proposta} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </>
  );
}
