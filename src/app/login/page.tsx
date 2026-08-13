"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Lido só depois do mount: window.location não existe durante o SSR.
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.has("redefinida")) setNotice("Senha redefinida com sucesso. Faça login.");
    else if (params.has("inativo")) setError("Sua conta foi desativada. Contate um administrador.");
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (signInError) {
      console.error("Supabase signInWithPassword error:", signInError);
      setError(
        signInError.message === "Invalid login credentials"
          ? "E-mail ou senha inválidos."
          : `Erro ao entrar: ${signInError.message}`,
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel esquerdo: marca (visível a partir de lg) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--brand-route) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent"
        />

        <div className="relative w-fit rounded-xl bg-white p-3 shadow-lg">
          <Logo height={28} />
        </div>

        <div className="relative">
          <p className="font-display text-3xl leading-snug font-semibold text-white">
            Cada proposta é uma rota.
            <br />
            Acompanhe todo o trajeto.
          </p>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Pipeline comercial, empresas e indicadores da Granvale Logística em um só lugar.
          </p>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Granvale Logística e Transportes
        </p>
      </div>

      {/* Painel direito: formulário */}
      <div className="flex flex-col items-center justify-center gap-8 bg-surface p-8 shadow-[-20px_0_25px_-5px_rgba(15,23,42,0.05)]">
        <Logo height={26} className="lg:hidden" />

        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Acessar Plataforma
          </h1>
          <p className="mt-1 text-sm text-brand-graphite-light">
            Insira suas credenciais para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-mono text-xs font-medium text-foreground">
                E-mail corporativo
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com.br"
                autoComplete="email"
                required
                icon={<Icon name="mail" />}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-mono text-xs font-medium text-foreground">
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs font-medium text-brand-accent hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                icon={<Icon name="lock" />}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {/*
              Só visual por enquanto: a sessão do Supabase aqui é baseada em
              cookie (@supabase/ssr), não em localStorage — diferenciar "lembrar
              de mim" exigiria controlar o maxAge do cookie na criação do client,
              o que não foi feito ainda pra não arriscar quebrar login sem testar
              a fundo.
            */}
            <label className="flex items-center gap-2 text-sm text-brand-graphite-light">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
              />
              Lembrar de mim
            </label>

            {notice && <p className="text-sm text-status-aprovado">{notice}</p>}
            {error && <p className="text-sm text-temp-quente">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="mt-2 gap-2">
              {isSubmitting ? "Entrando…" : "Entrar no Sistema"}
              {!isSubmitting && <Icon name="arrow_forward" size={18} />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-graphite-light">
            Problemas para acessar? Contate um administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
