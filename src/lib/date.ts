export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Período padrão dos filtros "De"/"Até" ao abrir Dashboard, Captação, Leads e
// Pipeline: últimos 90 dias em vez do histórico inteiro — o usuário ainda
// pode limpar/ajustar livremente.
export function last90DaysRange(): { dataInicio: string; dataFim: string } {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 90);
  return { dataInicio: formatDateInput(inicio), dataFim: formatDateInput(hoje) };
}
