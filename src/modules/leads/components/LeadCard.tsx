"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { SEGMENTO_LABEL, type Proposta } from "@/modules/pipeline/types";
import { useLeadsData } from "../context";
import { LeadDetailModal } from "./LeadDetailModal";

const TERMOMETRO_LABEL: Record<Proposta["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
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
  const { statuses } = useLeadsData();
  // Um lead Arquivado só volta pra outra coluna via "Reativar" no modal —
  // arrastar pra fora daqui ficaria sem confirmação e sem status_anterior_id.
  const isArquivado = statuses.find((s) => s.id === proposta.status_id)?.key === "arquivado";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(proposta.id),
    disabled: isArquivado,
  });
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      <Card
        ref={setNodeRef}
        style={transform ? { transform: CSS.Translate.toString(transform) } : undefined}
        {...listeners}
        {...attributes}
        // dnd-kit marca aria-disabled quando o drag está desabilitado, mas o
        // card continua clicável (abre o modal) — só o arrastar é bloqueado.
        aria-disabled={undefined}
        onClick={() => setIsDetailOpen(true)}
        className={cn(
          "touch-none select-none",
          isArquivado ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50",
        )}
      >
        <CardContent className="flex flex-col gap-2 p-3">
          <span className="font-mono text-xs text-brand-graphite-light">{proposta.numero_lead}</span>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={proposta.termometro}>{TERMOMETRO_LABEL[proposta.termometro]}</Badge>
            {proposta.segmento && <Badge variant="default">{SEGMENTO_LABEL[proposta.segmento]}</Badge>}
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
