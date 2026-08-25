import { timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";

// Comparação de string em tempo constante — usada pra validar segredos
// enviados em header (CRON_SECRET, SUPABASE_WEBHOOK_SECRET). Um `!==` comum
// retorna assim que encontra o primeiro caractere diferente, então a
// latência da resposta varia conforme quantos caracteres do segredo o
// atacante já acertou; isso permite descobrir o segredo byte a byte
// medindo tempo de resposta. `crypto.timingSafeEqual` sempre compara todos
// os bytes, então a latência não vaza informação.
export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return nodeTimingSafeEqual(bufA, bufB);
}
