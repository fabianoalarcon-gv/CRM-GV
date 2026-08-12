"use client";

import { useMemo, useState } from "react";
import { BoardView, type BoardViewProps } from "@/modules/pipeline/components/BoardView";
import { applyLeadFilters, EMPTY_LEAD_FILTERS, type LeadFilters } from "../utils";
import { LeadFiltersBar } from "./LeadFiltersBar";

export type LeadsBoardSectionProps = Omit<BoardViewProps, "filters">;

export function LeadsBoardSection(props: LeadsBoardSectionProps) {
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_LEAD_FILTERS);

  const filteredPropostas = useMemo(
    () => applyLeadFilters(props.initialPropostas, filters),
    [props.initialPropostas, filters],
  );

  return (
    <BoardView
      {...props}
      initialPropostas={filteredPropostas}
      filters={<LeadFiltersBar value={filters} onChange={setFilters} />}
    />
  );
}
