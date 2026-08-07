export interface Cliente {
  id: number;
  nome: string;
  setor: string | null;
  endereco: string | null;
  observacoes: string | null;
  created_at: string;
}
