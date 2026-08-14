export interface Empresa {
  id: number;
  nome: string;
  cnpj: string | null;
  setor: string | null;
  endereco: string | null;
  numero: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  origem_lead: string | null;
  site: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface EmpresaListItem extends Empresa {
  ultima_proposta: string | null;
}

export interface EmpresaInput {
  nome: string;
  cnpj: string;
  setor: string;
  endereco: string;
  numero: string;
  cidade: string;
  uf: string;
  cep: string;
  origem_lead: string;
  site: string;
  observacoes: string;
}

export interface Contato {
  id: number;
  empresa_id: number;
  nome: string;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  telefone_tipo: string | null;
  principal: boolean;
  created_at: string;
}

export interface ContatoInput {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  telefone_tipo: string;
  principal: boolean;
}

export interface PropostaResumo {
  id: number;
  numero_proposta: string | null;
  numero_lead: string | null;
  segmento: string | null;
  valor: number | null;
  termometro: "frio" | "morno" | "quente";
  status_label: string;
  created_at: string;
  updated_at: string;
}

export interface Interacao {
  id: number;
  empresa_id: number;
  tipo: string | null;
  descricao: string;
  data_interacao: string;
  autor_nome: string | null;
}

export interface InteracaoInput {
  tipo: string;
  descricao: string;
}
