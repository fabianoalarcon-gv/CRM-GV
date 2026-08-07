export interface Cliente {
  id: number;
  nome: string;
  setor: string | null;
  endereco: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface ClienteListItem extends Cliente {
  ultima_proposta: string | null;
}

export interface ClienteInput {
  nome: string;
  setor: string;
  endereco: string;
  observacoes: string;
}

export interface Contato {
  id: number;
  cliente_id: number;
  nome: string;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  created_at: string;
}

export interface ContatoInput {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
}

export interface PropostaResumo {
  id: number;
  numero_proposta: string;
  data_envio: string;
  valor: number;
  termometro: "frio" | "morno" | "quente";
  status_label: string;
}

export interface Interacao {
  id: number;
  cliente_id: number;
  tipo: string | null;
  descricao: string;
  data_interacao: string;
  autor_nome: string | null;
}

export interface InteracaoInput {
  tipo: string;
  descricao: string;
}
