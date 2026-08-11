// Ordem fixa (também usada em TIPO_OPTIONS) — validada com a skill dataviz
// (validate_palette.js) para manter a separação de cor entre categorias
// vizinhas; não reordenar sem revalidar.
export type CompromissoTipo =
  | "fretes"
  | "reuniao"
  | "urgente"
  | "embarque"
  | "outro"
  | "ligacao"
  | "email"
  | "visita";

export interface Compromisso {
  id: number;
  titulo: string;
  descricao: string | null;
  inicio: string;
  fim: string | null;
  tipo: CompromissoTipo | null;
  cliente_id: number | null;
  cliente_nome: string | null;
  criado_por_nome: string | null;
  proposta_id: number | null;
  created_at: string;
}

export interface CompromissoInput {
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
  tipo: CompromissoTipo;
  cliente_id: number | null;
}

export interface ClienteOption {
  id: number;
  nome: string;
}
