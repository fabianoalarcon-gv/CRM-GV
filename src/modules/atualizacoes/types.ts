export type AtualizacaoItemTipo = "solicitacao" | "correcao" | "melhoria" | "inclusao";

export interface AtualizacaoItem {
  id: number;
  numeroChamado: string | null;
  tipo: AtualizacaoItemTipo;
  local: string;
  descricao: string;
  createdAt: string;
}

export interface Atualizacao {
  id: number;
  numeroPatch: string;
  dataHora: string;
  createdAt: string;
  versaoAtual: boolean;
  itens: AtualizacaoItem[];
}

export interface AtualizacaoInput {
  numeroPatch: string;
  dataHora: string;
}

export interface AtualizacaoItemInput {
  numeroChamado: string;
  tipo: AtualizacaoItemTipo;
  local: string;
  descricao: string;
}
