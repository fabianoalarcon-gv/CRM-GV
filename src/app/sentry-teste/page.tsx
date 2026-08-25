"use client";

// Página temporária só pra validar a integração do Sentry em produção —
// remover depois de confirmar no painel.
export default function SentryTestePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-lg font-semibold">Teste do Sentry</h1>
      <button
        className="rounded bg-red-600 px-4 py-2 text-white"
        onClick={() => {
          throw new Error("Erro de teste — disparado no navegador (client)");
        }}
      >
        Disparar erro no navegador
      </button>
      <button
        className="rounded bg-red-600 px-4 py-2 text-white"
        onClick={() => fetch("/api/sentry-teste")}
      >
        Disparar erro no servidor
      </button>
    </div>
  );
}
