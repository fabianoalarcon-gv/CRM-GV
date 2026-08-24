"use client";

import { useMemo, useState } from "react";
import type { EmpresaOption } from "@/modules/pipeline/types";
import { applyCaptacaoFilters, defaultCaptacaoFilters } from "../utils";
import type { Captacao } from "../types";
import { CaptacaoFiltersBar } from "./CaptacaoFiltersBar";
import { CaptacaoListView } from "./CaptacaoListView";
import { NovaCaptacaoButton } from "./NovaCaptacaoButton";

export interface CaptacaoBoardSectionProps {
  captacoes: Captacao[];
  empresas: EmpresaOption[];
}

export function CaptacaoBoardSection({ captacoes, empresas }: CaptacaoBoardSectionProps) {
  const [filters, setFilters] = useState(defaultCaptacaoFilters);
  const filtered = useMemo(() => applyCaptacaoFilters(captacoes, filters), [captacoes, filters]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <CaptacaoFiltersBar value={filters} onChange={setFilters} />
        <NovaCaptacaoButton empresas={empresas} />
      </div>

      <CaptacaoListView captacoes={filtered} />
    </div>
  );
}
