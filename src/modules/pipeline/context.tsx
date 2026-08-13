"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  EmpresaOption,
  ContatoPrincipal,
  ProfileOption,
  ProposalHistoryEntry,
  ProposalStatus,
  ProximoCompromisso,
} from "./types";
import type { Compromisso } from "@/modules/calendario/types";

export interface PipelineDataValue {
  statuses: ProposalStatus[];
  empresas: EmpresaOption[];
  profiles: ProfileOption[];
  history: ProposalHistoryEntry[];
  contatosPrincipais: Map<number, ContatoPrincipal>;
  proximosCompromissos: Map<number, ProximoCompromisso>;
  compromissos: Compromisso[];
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
