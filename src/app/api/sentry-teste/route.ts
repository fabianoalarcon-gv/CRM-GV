// Rota temporária só pra validar a integração do Sentry — remover depois de
// confirmar no painel.
export async function GET() {
  throw new Error("Erro de teste — disparado no servidor (API route)");
}
