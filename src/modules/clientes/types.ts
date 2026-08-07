export interface Cliente {
  id: number;
  nome: string;
  setor: string | null;
  endereco: string | null;
  observacoes: string | null;
  created_at: string;
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
