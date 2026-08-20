export interface Captacao {
  id: number;
  empresaId: number;
  empresaNome: string;
  setor: string | null;
  cidade: string | null;
  uf: string | null;
  temContato: boolean;
  createdAt: string;
}
