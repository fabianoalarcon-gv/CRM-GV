"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="text-sm text-gray-500">
          O erro já foi registrado. Tente recarregar a página.
        </p>
      </body>
    </html>
  );
}
