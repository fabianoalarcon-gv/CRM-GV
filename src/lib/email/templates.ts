// URL pública do app na Vercel — usada só pra referenciar a imagem do
// logotipo (public/logo_logihub.png) no rodapé do e-mail; e-mail HTML não
// pode referenciar um arquivo local, precisa de uma URL acessível.
const APP_URL = "https://crm-gv.vercel.app";
const LOGO_URL = `${APP_URL}/logo_logihub.png`;

const dataFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const TERMOMETRO_LABEL: Record<string, string> = {
  quente: "Quente",
  morno: "Morno",
  frio: "Frio",
};

const SEGMENTO_LABEL: Record<string, string> = {
  armazenagem: "Armazenagem",
  servico: "Serviço",
  transporte: "Transporte",
};

function linha(rotulo: string, valor: string): string {
  return `<p style="margin:2px 0;"><strong>${rotulo}:</strong> ${valor}</p>`;
}

function rodapeComLogo(corpoHtml: string): string {
  return `${corpoHtml}<br /><img src="${LOGO_URL}" alt="LogiHub CRM" style="max-width:180px;" />`;
}

export interface LeadPropostaEmailData {
  numeroLead: string | null;
  numeroProposta: string | null;
  createdAt: string;
  empresaNome: string | null;
  descricao: string | null;
  termometro: string | null;
  segmento: string | null;
  valor: number | null;
  statusLabel: string | null;
  responsavelNome: string | null;
}

// Corpo detalhado, campo por campo, usado nas notificações de novo Lead e
// nova Proposta — "Proposta" quando já tem numero_proposta (mesma linha da
// tabela propostas, só muda de estágio), "Lead" caso contrário.
export function buildLeadPropostaEmailBody(data: LeadPropostaEmailData): string {
  const ehProposta = Boolean(data.numeroProposta);
  const rotulo = ehProposta ? "Proposta" : "Lead";
  const numero = ehProposta ? data.numeroProposta : data.numeroLead;

  const linhas = [
    linha(`${rotulo} Nº`, numero ?? "—"),
    linha("Data Inclusão", dataFormatter.format(new Date(data.createdAt))),
    linha("Empresa", data.empresaNome ?? "Sem empresa"),
    linha(`Descrição do ${rotulo}`, data.descricao ?? "Sem descrição"),
    linha(
      "Termômetro",
      data.termometro ? (TERMOMETRO_LABEL[data.termometro] ?? data.termometro) : "Sem termômetro",
    ),
    linha(
      "Segmento",
      data.segmento ? (SEGMENTO_LABEL[data.segmento] ?? data.segmento) : "Sem segmento",
    ),
    linha("Valor estimado", data.valor ? currencyFormatter.format(data.valor) : "Sem valor"),
    linha("Status", data.statusLabel ?? "—"),
    linha("Responsável", data.responsavelNome ?? "Sem responsável"),
  ];

  return rodapeComLogo(linhas.join(""));
}

export interface NovaEmpresaEmailData {
  empresaNome: string;
  autorNome: string | null;
}

export function buildNovaEmpresaEmailBody(data: NovaEmpresaEmailData): string {
  const linhas = [
    linha("Nova empresa cadastrada", data.empresaNome),
    linha("Cadastrado por", data.autorNome ?? "Sistema"),
  ];
  return rodapeComLogo(linhas.join(""));
}

// Corpo simples (texto único da notificação) usado pelos demais tipos de
// evento (nova Ação, movimentação de card, aprovação/reprovação, etc.).
export function buildSimpleEmailBody(mensagem: string): string {
  return rodapeComLogo(`<p>${mensagem}</p>`);
}
