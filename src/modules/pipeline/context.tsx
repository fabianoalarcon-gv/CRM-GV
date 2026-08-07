"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ClienteOption, ProfileOption, ProposalHistoryEntry, ProposalStatus } from "./types";

export interface PipelineDataValue {
  statuses: ProposalStatus[];
  clientes: ClienteOption[];
  profiles: ProfileOption[];
  history: ProposalHistoryEntry[];
}

const PipelineDataContext = createContext<PipelineDataValue | null>(null);

export function PipelineDataProvider({
  value,
  children,
}: {
  value: PipelineDataValue;
  children: ReactNode;
}) {
  return <PipelineDataContext.Provider value={value}>{children}</PipelineDataContext.Provider>;
}

export function usePipelineData(): PipelineDataValue {
  const ctx = useContext(PipelineDataContext);
  if (!ctx) throw new Error("usePipelineData deve ser usado dentro de um PipelineDataProvider");
  return ctx;
}
