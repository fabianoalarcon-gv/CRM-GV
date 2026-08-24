import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <Logo height={28} />

      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
          <Icon name="wrong_location" size={32} />
        </div>

        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Erro 404
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Essa rota não existe
        </h1>
        <p className="max-w-sm text-sm text-brand-graphite-light">
          O link que você tentou acessar não existe (ou não existe mais). Deve ter sido um desvio
          de rota — vamos te trazer de volta pro trajeto certo.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-navy px-5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-light dark:bg-brand-accent dark:text-brand-navy dark:hover:bg-brand-accent-dark"
      >
        <Icon name="home" size={18} />
        Voltar para o sistema
      </Link>
    </div>
  );
}
