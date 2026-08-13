"use client";

import type { ComponentType } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/cn";
import type { ProposalStatus, Proposta } from "../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export interface ColumnItemLabel {
  singular: string;
  plural: string;
  empty: string;
}

const DEFAULT_ITEM_LABEL: ColumnItemLabel = {
  singular: "proposta",
  plural: "propostas",
  empty: "Nenhuma proposta nesta coluna.",
};

export interface ColumnProps {
  status: ProposalStatus;
  propostas: Proposta[];
  CardComponent: ComponentType<{ proposta: Proposta }>;
  itemLabel?: ColumnItemLabel;
}

export function Column({
  status,
  propostas,
  CardComponent,
  itemLabel = DEFAULT_ITEM_LABEL,
}: ColumnProps) {
  // Arquivado só é alcançável pelo botão "Arquivar" (com confirmação) no
  // modal do card — arrastar direto pra cá ficaria sem essa confirmação.
  const { setNodeRef, isOver } = useDroppable({
    id: String(status.id),
    disabled: status.key === "arquivado",
  });
  const total = propostas.reduce((sum, p) => sum + (p.valor ?? 0), 0);

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl bg-black/[.02]">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{status.label}</h2>
          <p className="text-xs text-brand-graphite-light">
            {propostas.length} {propostas.length === 1 ? itemLabel.singular : itemLabel.plural}
          </p>
        </div>
        <span className="font-mono text-xs text-brand-graphite-light">
          {currencyFormatter.format(total)}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors",
          isOver && "bg-brand-accent/10",
        )}
      >
        {propostas.map((proposta) => (
          <CardComponent key={proposta.id} proposta={proposta} />
        ))}
        {propostas.length === 0 && (
          <p className="p-2 text-center text-xs text-brand-graphite-light">{itemLabel.empty}</p>
        )}
      </div>
    </div>
  );
}
