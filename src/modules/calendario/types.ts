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
  | "visita"
  | "follow_up";

export interface Compromisso {
  id: number;
  titulo: string;
  descricao: string | null;
  inicio: string;
  fim: string | null;
  tipo: CompromissoTipo | null;
  empresa_id: number | null;
  empresa_nome: string | null;
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
  empresa_id: number | null;
}

export interface EmpresaOption {
  id: number;
  nome: string;
}
