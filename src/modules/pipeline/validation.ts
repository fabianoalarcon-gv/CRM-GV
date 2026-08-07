// PIPE-10: padrão NNN/AA, com sufixo opcional de revisão (ex: "028/25" ou "028/25.1").
const NUMERO_PROPOSTA_PATTERN = /^\d{3}\/\d{2}(\.\d+)?$/;

export function isValidNumeroProposta(value: string): boolean {
  return NUMERO_PROPOSTA_PATTERN.test(value.trim());
}

export const NUMERO_PROPOSTA_HINT = "Formato NNN/AA, ex: 028/25 (ou 028/25.1 para revisão)";
