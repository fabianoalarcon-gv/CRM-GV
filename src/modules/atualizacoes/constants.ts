import type { AtualizacaoItemTipo } from "./types";

export const TIPO_OPTIONS: { value: AtualizacaoItemTipo; label: string }[] = [
  { value: "solicitacao", label: "Solicitação" },
  { value: "correcao", label: "Correção" },
  { value: "melhoria", label: "Melhoria" },
  { value: "inclusao", label: "Inclusão" },
];

export const TIPO_LABEL: Record<AtualizacaoItemTipo, string> = {
  solicitacao: "Solicitação",
  correcao: "Correção",
  melhoria: "Melhoria",
  inclusao: "Inclusão",
};

export const TIPO_BADGE_VARIANT: Record<AtualizacaoItemTipo, "info" | "success" | "warning" | "default"> = {
  solicitacao: "info",
  correcao: "warning",
  melhoria: "success",
  inclusao: "default",
};
