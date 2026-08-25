import * as Sentry from "@sentry/nextjs";

export async function register() {
  console.log("[sentry-debug] register() called, NEXT_RUNTIME=", process.env.NEXT_RUNTIME);

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
