"use client";

import { useMemo, useState } from "react";
import { BoardView, type BoardViewProps } from "./BoardView";
import { PropostaFiltersBar } from "./PropostaFiltersBar";
import { applyPropostaFilters, EMPTY_PROPOSTA_FILTERS, type PropostaFilters } from "../utils";

export type PipelineBoardSectionProps = Omit<BoardViewProps, "filters">;

export function PipelineBoardSection(props: PipelineBoardSectionProps) {
  const [filters, setFilters] = useState<PropostaFilters>(EMPTY_PROPOSTA_FILTERS);

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
