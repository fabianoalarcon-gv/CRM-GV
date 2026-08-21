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

function iconDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Ícones em SVG embutido (data URI) — sem depender de um arquivo hospedado
// só pra essas duas marcações pequenas.
const ICON_APROVADO = iconDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#16a34a"/><path d="M7 12.5l3 3 7-7" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
);
const ICON_REPROVADO = iconDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#dc2626"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
);

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

export interface MovimentacaoCardEmailData {
  numeroLead: string | null;
  numeroProposta: string | null;
  empresaNome: string | null;
  statusAnterior: string | null;
  statusNovo: string | null;
  autorNome: string | null;
}

// Aqui o negrito vai nos VALORES da frase (número, empresa, status), não nos
// rótulos — diferente de linha(), que usa o padrão inverso.
export function buildMovimentacaoCardEmailBody(data: MovimentacaoCardEmailData): string {
  const ehProposta = Boolean(data.numeroProposta);
  const rotulo = ehProposta ? "Proposta" : "Lead";
  const numero = ehProposta ? data.numeroProposta : data.numeroLead;

  const frase =
    `<p style="margin:2px 0;">${rotulo} Nº <strong>${numero ?? "—"}</strong> da empresa ` +
    `<strong>${data.empresaNome ?? "Sem empresa"}</strong> foi movido do status ` +
    `<strong>${data.statusAnterior ?? "—"}</strong> para <strong>${data.statusNovo ?? "—"}</strong>.</p>`;

  return rodapeComLogo(frase + linha("Usuário", data.autorNome ?? "Sistema"));
}

export interface PropostaResultadoEmailData {
  numeroProposta: string;
  empresaNome: string | null;
  aprovado: boolean;
  autorNome: string | null;
}

export function buildPropostaResultadoEmailBody(data: PropostaResultadoEmailData): string {
  const resultadoLabel = data.aprovado ? "Aprovado" : "Reprovado";
  const icon = data.aprovado
    ? `<img src="${ICON_APROVADO}" alt="Aprovado" width="16" height="16" style="vertical-align:middle;" />`
    : `<img src="${ICON_REPROVADO}" alt="Reprovado" width="16" height="16" style="vertical-align:middle;" />`;

  const frase =
    `<p style="margin:2px 0;">Proposta Nº <strong>${data.numeroProposta}</strong> da empresa ` +
    `<strong>${data.empresaNome ?? "Sem empresa"}</strong> foi <strong>${resultadoLabel}</strong>. ` +
    `${icon}</p>`;

  return rodapeComLogo(frase + linha("Usuário", data.autorNome ?? "Sistema"));
}

// Corpo simples (texto único da notificação) usado pelos demais tipos de
// evento (nova Ação, etc.).
export function buildSimpleEmailBody(mensagem: string): string {
  return rodapeComLogo(`<p>${mensagem}</p>`);
}
