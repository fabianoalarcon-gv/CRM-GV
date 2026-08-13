"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { usePipelineData } from "../context";
import { ProposalDetailModal } from "./ProposalDetailModal";
import { ResponsavelAvatar } from "./ResponsavelAvatar";
import { TERMOMETRO_COLOR, TermometroBadge } from "./TermometroBadge";
import { SEGMENTO_LABEL, type Proposta } from "../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const compromissoDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const compromissoTimeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function daysAgoLabel(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return days === 0 ? "hoje" : `${days}d`;
}

export function ProposalCard({ proposta }: { proposta: Proposta }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(proposta.id),
  });
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { statuses, profiles, contatosPrincipais, proximosCompromissos } = usePipelineData();

  const responsavel = profiles.find((p) => p.id === proposta.responsavel_id);
  const contato = contatosPrincipais.get(proposta.cliente_id);
  const proximoCompromisso = proximosCompromissos.get(proposta.id);
  const isFechado = statuses.find((s) => s.id === proposta.status_id)?.key === "fechado";

  return (
    <>
      <Card
        ref={setNodeRef}
        style={{
          ...(transform ? { transform: CSS.Translate.toString(transform) } : undefined),
          borderTop: `3px solid ${TERMOMETRO_COLOR[proposta.termometro]}`,
        }}
        {...listeners}
        {...attributes}
        onClick={() => setIsDetailOpen(true)}
        className={cn(
          "touch-none cursor-grab select-none active:cursor-grabbing",
          isDragging && "opacity-50",
        )}
      >
        <CardContent className="flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-brand-graphite-light">
              {proposta.numero_proposta ?? proposta.numero_lead ?? "—"}
            </span>
            <TermometroBadge value={proposta.termometro} />
          </div>

          {isFechado && (
            <div
              className={cn(
                "flex w-full items-center justify-center rounded-lg py-1 text-sm font-medium",
                proposta.resultado === "aprovado" && "bg-status-aprovado/15 text-status-aprovado",
                proposta.resultado === "reprovado" && "bg-temp-quente/15 text-temp-quente",
                !proposta.resultado && "bg-black/[.05] text-brand-graphite-light",
              )}
            >
              {proposta.resultado === "aprovado" && "✓ Aprovado"}
              {proposta.resultado === "reprovado" && "✗ Reprovado"}
              {!proposta.resultado && "Resultado pendente"}
            </div>
          )}

          {proposta.segmento && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="default">{SEGMENTO_LABEL[proposta.segmento]}</Badge>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-foreground">{proposta.cliente_nome}</p>
            {proposta.cliente_setor && (
              <p className="text-xs text-brand-graphite-light">{proposta.cliente_setor}</p>
            )}
          </div>

          {contato && (
            <div
              className="flex items-center gap-1 text-xs text-brand-graphite-light"
              title={contato.telefone ?? undefined}
            >
              <Icon name="person" size={14} className="shrink-0" />
              <span className="truncate">{contato.nome}</span>
            </div>
          )}

          {proximoCompromisso && (
            <div
              className="flex w-fit items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-cal-reuniao) 12%, transparent)",
                color: "var(--color-cal-reuniao)",
              }}
              title={proximoCompromisso.titulo}
            >
              <Icon name="event" size={13} />
              <span className="truncate">
                {compromissoDateFormatter.format(new Date(proximoCompromisso.inicio))} ·{" "}
                {compromissoTimeFormatter.format(new Date(proximoCompromisso.inicio))}
              </span>
            </div>
          )}

          <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
            <div className="flex items-center gap-2 text-[11px] text-brand-graphite-light">
              <span
                className="flex items-center gap-0.5"
                title={`Criada há ${daysAgoLabel(proposta.created_at)}`}
              >
                <Icon name="schedule" size={13} />
                {daysAgoLabel(proposta.created_at)}
              </span>
              <span
                className="flex items-center gap-0.5"
                title={`Última alteração há ${daysAgoLabel(proposta.updated_at)}`}
              >
                <Icon name="history" size={13} />
                {daysAgoLabel(proposta.updated_at)}
              </span>
              {responsavel && <ResponsavelAvatar fullName={responsavel.full_name} />}
            </div>
            {proposta.valor != null && (
              <span className="font-mono text-sm font-semibold text-foreground">
                {currencyFormatter.format(proposta.valor)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <ProposalDetailModal
        proposta={proposta}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
