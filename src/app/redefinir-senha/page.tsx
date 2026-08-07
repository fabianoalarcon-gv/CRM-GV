"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // O link de recuperação do Supabase chega como fragmento (#access_token=...),
    // que nunca é enviado ao servidor. O client SSR (@supabase/ssr), diferente do
    // client "puro" do supabase-js, não faz o parse automático desse fragmento —
    // por isso a sessão de recovery precisa ser estabelecida manualmente aqui.
    async function establishSession() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!setSessionError) {
          window.history.replaceState(null, "", window.location.pathname);
          setHasSession(true);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    }

    establishSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setIsSubmitting(false);
      setError(`Erro ao redefinir senha: ${updateError.message}`);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?redefinida=1");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <Logo height={26} />

      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Recuperar acesso
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Definir nova senha
        </h1>

        {hasSession === false && (
          <div className="mt-8 flex flex-col gap-4">
            <p className="text-sm text-temp-quente">
              Link inválido ou expirado. Solicite um novo e-mail de recuperação.
            </p>
            <Link
              href="/esqueci-senha"
              className="text-sm font-medium text-brand-accent hover:underline"
            >
              ← Solicitar novo link
            </Link>
          </div>
        )}

        {hasSession && (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {error && <p className="text-sm text-temp-quente">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Salvando…" : "Redefinir senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
