"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(`Erro ao solicitar recuperação: ${resetError.message}`);
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <Logo height={26} />

      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Recuperar acesso
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Esqueci minha senha
        </h1>

        {sent ? (
          <div className="mt-8 flex flex-col gap-4">
            <p className="text-sm text-brand-graphite-light">
              Se esse e-mail existir na nossa base, você vai receber um link para redefinir a
              senha em instantes.
            </p>
            <Link href="/login" className="text-sm font-medium text-brand-accent hover:underline">
              ← Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-brand-graphite-light">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {error && <p className="text-sm text-temp-quente">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? "Enviando…" : "Enviar link de recuperação"}
              </Button>
              <Link
                href="/login"
                className="text-center text-sm text-brand-graphite-light hover:text-brand-accent"
              >
                ← Voltar para o login
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
