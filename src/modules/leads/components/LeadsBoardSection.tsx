"use client";

import { useMemo, useState } from "react";
import { BoardView, type BoardViewProps } from "@/modules/pipeline/components/BoardView";
import { PropostaFiltersBar } from "@/modules/pipeline/components/PropostaFiltersBar";
import {
  applyPropostaFilters,
  defaultPropostaFilters,
  type PropostaFilters,
} from "@/modules/pipeline/utils";

export type LeadsBoardSectionProps = Omit<BoardViewProps, "filters">;

export function LeadsBoardSection(props: LeadsBoardSectionProps) {
  const [filters, setFilters] = useState<PropostaFilters>(defaultPropostaFilters);

  const filteredPropostas = useMemo(
    () => applyPropostaFilters(props.initialPropostas, filters),
    [props.initialPropostas, filters],
  );

  return (
    <BoardView
      {...props}
      initialPropostas={filteredPropostas}
      filters={<PropostaFiltersBar value={filters} onChange={setFilters} />}
    />
  );
}
