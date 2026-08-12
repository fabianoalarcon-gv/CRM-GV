"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { BoardClient } from "./BoardClient";
import { ViewToggle, type BoardViewMode } from "./ViewToggle";
import type { ProposalStatus, Proposta } from "../types";

export interface BoardViewProps {
  title: string;
  subtitle: string;
  initialPropostas: Proposta[];
  columnStatuses: ProposalStatus[];
  CardComponent: ComponentType<{ proposta: Proposta }>;
  ListComponent: ComponentType<{ propostas: Proposta[] }>;
  newButton: ReactNode;
  filters?: ReactNode;
}

export function BoardView({
  title,
  subtitle,
  initialPropostas,
  columnStatuses,
  CardComponent,
  ListComponent,
  newButton,
  filters,
}: BoardViewProps) {
  const [viewMode, setViewMode] = useState<BoardViewMode>("kanban");

  const columnStatusIds = new Set(columnStatuses.map((s) => s.id));
  const propostas = initialPropostas.filter((p) => columnStatusIds.has(p.status_id));

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
              Comercial
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {filters}
            <div className="flex items-center gap-2">
              <ViewToggle value={viewMode} onChange={setViewMode} />
              {newButton}
            </div>
          </div>
        </div>
        <p className="text-sm text-brand-graphite-light">{subtitle}</p>
      </div>

      {viewMode === "kanban" ? (
        <BoardClient
          initialPropostas={initialPropostas}
          columnStatuses={columnStatuses}
          CardComponent={CardComponent}
        />
      ) : (
        <ListComponent propostas={propostas} />
      )}
    </>
  );
}
