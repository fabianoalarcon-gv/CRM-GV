import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  // Só captura de erro por enquanto, sem tracing de performance (evita
  // consumir a cota do plano gratuito com dados que ninguém vai olhar ainda).
  tracesSampleRate: 0,
});
