export type CompromissoTipo = "fretes" | "reuniao" | "urgente" | "embarque" | "outro";

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
