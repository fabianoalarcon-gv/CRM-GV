"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { ProposalDetailModal } from "./ProposalDetailModal";
import type { Proposta } from "../types";

const TERMOMETRO_LABEL: Record<Proposta["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProposalCard({ proposta }: { proposta: Proposta }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(proposta.id),
  });
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-brand-graphite-light">
              {proposta.numero_proposta}
            </span>
            <Badge variant={proposta.termometro}>{TERMOMETRO_LABEL[proposta.termometro]}</Badge>
          </div>
          <p className="text-sm font-medium text-foreground">{proposta.cliente_nome}</p>
          {proposta.servico && (
            <p className="text-xs text-brand-graphite-light">{proposta.servico}</p>
          )}
          <p className="font-mono text-sm font-semibold text-foreground">
            {currencyFormatter.format(proposta.valor)}
          </p>
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
