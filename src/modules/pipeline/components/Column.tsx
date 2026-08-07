"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/cn";
import { ProposalCard } from "./ProposalCard";
import type { ProposalStatus, Proposta } from "../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export interface ColumnProps {
  status: ProposalStatus;
  propostas: Proposta[];
}

export function Column({ status, propostas }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: String(status.id) });
  const total = propostas.reduce((sum, p) => sum + p.valor, 0);

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl bg-black/[.02]">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{status.label}</h2>
          <p className="text-xs text-brand-graphite-light">
            {propostas.length} {propostas.length === 1 ? "proposta" : "propostas"}
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
          <ProposalCard key={proposta.id} proposta={proposta} />
        ))}
        {propostas.length === 0 && (
          <p className="p-2 text-center text-xs text-brand-graphite-light">
            Nenhuma proposta nesta coluna.
          </p>
        )}
      </div>
    </div>
  );
}
