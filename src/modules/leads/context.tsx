"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  ClienteOption,
  ProposalHistoryEntry,
  ProposalStatus,
  ProximoCompromisso,
} from "@/modules/pipeline/types";
import type { Compromisso } from "@/modules/calendario/types";

export interface LeadsDataValue {
  statuses: ProposalStatus[];
  clientes: ClienteOption[];
  history: ProposalHistoryEntry[];
  compromissos: Compromisso[];
  proximosCompromissos: Map<number, ProximoCompromisso>;
}

const LeadsDataContext = createContext<LeadsDataValue | null>(null);

export function LeadsDataProvider({
  value,
  children,
}: {
  value: LeadsDataValue;
  children: ReactNode;
}) {
  return <LeadsDataContext.Provider value={value}>{children}</LeadsDataContext.Provider>;
}

export function useLeadsData(): LeadsDataValue {
  const ctx = useContext(LeadsDataContext);
  if (!ctx) throw new Error("useLeadsData deve ser usado dentro de um LeadsDataProvider");
  return ctx;
}
