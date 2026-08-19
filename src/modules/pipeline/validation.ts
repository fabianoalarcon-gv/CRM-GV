// PIPE-10: padrão NNN/AA, com sufixo opcional de revisão (ex: "028/25" ou
// "028/25.1"). Prefixo "P" opcional (ex: "P021/26") — formato usado quando o
// número é gerado automaticamente a partir de um Lead (Gerar Proposta).
const NUMERO_PROPOSTA_PATTERN = /^P?\d{3}\/\d{2}(\.\d+)?$/;

export function isValidNumeroProposta(value: string): boolean {
  return NUMERO_PROPOSTA_PATTERN.test(value.trim());
}

export const NUMERO_PROPOSTA_HINT = "Formato NNN/AA, ex: 028/25 (ou 028/25.1 para revisão)";

// Motivo só é exigido quando o resultado é Reprovado — Aprovado (ou ainda
// sem decisão) não precisa dele. Quando o motivo escolhido é "Outro", o
// detalhe também é obrigatório.
export function isValidMotivoReprovacao(
  resultado: "aprovado" | "reprovado" | null,
  motivo: string,
  detalhe: string,
): boolean {
  if (resultado !== "reprovado") return true;
  if (!motivo) return false;
  if (motivo === "outro") return detalhe.trim().length > 0;
  return true;
}
