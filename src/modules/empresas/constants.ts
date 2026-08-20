export const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
].map((uf) => ({ value: uf, label: uf }));

export const ORIGEM_LEAD_OPTIONS = [
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "site", label: "Site" },
  { value: "indicacao", label: "Indicação" },
  { value: "organico", label: "Orgânico" },
  { value: "trafego_pago", label: "Tráfego Pago" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "evento", label: "Evento" },
  { value: "parceria", label: "Parceria" },
];

export const ORIGEM_LEAD_LABEL: Record<string, string> = Object.fromEntries(
  ORIGEM_LEAD_OPTIONS.map((o) => [o.value, o.label]),
);

// Mesma paleta categórica dos gráficos do Dashboard (PieChartCard/globals.css)
// — dá uma cor fixa e consistente pra cada origem em qualquer badge que a
// exiba. Só 5 cores pra 9 origens: repete o ciclo, igual PieChartCard faz
// quando tem mais fatias que cores.
const ORIGEM_LEAD_PALETTE = [
  "var(--color-chart-cat-1)",
  "var(--color-chart-cat-2)",
  "var(--color-chart-cat-3)",
  "var(--color-chart-cat-4)",
  "var(--color-chart-cat-5)",
];

export const ORIGEM_LEAD_COLOR: Record<string, string> = Object.fromEntries(
  ORIGEM_LEAD_OPTIONS.map((o, i) => [o.value, ORIGEM_LEAD_PALETTE[i % ORIGEM_LEAD_PALETTE.length]]),
);

export const TELEFONE_TIPO_OPTIONS = [
  { value: "celular", label: "Celular" },
  { value: "fixo", label: "Fixo" },
];

export const TELEFONE_TIPO_LABEL: Record<string, string> = Object.fromEntries(
  TELEFONE_TIPO_OPTIONS.map((o) => [o.value, o.label]),
);
