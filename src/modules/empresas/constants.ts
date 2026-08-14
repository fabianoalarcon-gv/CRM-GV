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
