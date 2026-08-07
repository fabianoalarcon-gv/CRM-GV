"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/brand/Logo";
import { RouteLine } from "@/components/ui/RouteLine";
import { createClient } from "@/lib/supabase/client";
import { DEV_BYPASS_COOKIE, DEV_BYPASS_EMAIL, DEV_BYPASS_PASSWORD } from "@/lib/dev-bypass";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError) {
      setIsSubmitting(false);
      router.push("/");
      router.refresh();
      return;
    }

    // TEMPORÁRIO — ver BUG-005 em bugs.md. Login real falhou (ex: em produção,
    // no Vercel); se for a credencial de teste conhecida, cai no bypass como
    // último recurso. Localmente o login real funciona e é sempre tentado
    // primeiro — só usa o bypass quando ele de fato falha, pra não perder
    // acesso a dados reais (protegidos por RLS) sem necessidade.
    if (email === DEV_BYPASS_EMAIL && password === DEV_BYPASS_PASSWORD) {
      document.cookie = `${DEV_BYPASS_COOKIE}=1; path=/; max-age=86400`;
      setIsSubmitting(false);
      router.push("/");
      router.refresh();
      return;
    }

    setIsSubmitting(false);
    console.error("Supabase signInWithPassword error:", signInError);
    setError(
      signInError.message === "Invalid login credentials"
        ? "E-mail ou senha inválidos."
        : `Erro ao entrar: ${signInError.message}`,
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--brand-route) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <Logo height={28} className="relative !bg-white px-2 py-1" />

        <div className="relative">
          <p className="font-display text-3xl leading-snug font-semibold text-white">
            Cada proposta é uma rota.
            <br />
            Acompanhe todo o trajeto.
          </p>
          <div className="mt-8 max-w-xs">
            <RouteLine stops={3} />
          </div>
          <p className="mt-4 text-sm text-white/60">
            Pipeline comercial, clientes e indicadores da Granvale Logística em um só lugar.
          </p>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Granvale Logística e Transportes
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 p-8">
        <Logo height={26} className="lg:hidden" />

        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Bem-vindo
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
            Entrar no LogiHub
          </h1>
          <p className="mt-1 text-sm text-brand-graphite-light">
            Use as credenciais fornecidas pela sua equipe.
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
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <p className="text-sm text-temp-quente">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
