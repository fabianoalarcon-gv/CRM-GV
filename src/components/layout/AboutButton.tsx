"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Logo } from "@/components/brand/Logo";
import { getVersaoAtualNumero } from "@/modules/atualizacoes/actions";

export function AboutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [versaoAtual, setVersaoAtual] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const numero = await getVersaoAtualNumero();
      if (cancelled) return;
      setVersaoAtual(numero);
      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Sobre o App"
        aria-label="Sobre o App"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04]"
      >
        <Icon name="info" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Sobre o App">
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <Logo height={64} />

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
              Versão atual
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">
              {isLoading ? "…" : versaoAtual ? `Patch ${versaoAtual}` : "Não definida"}
            </p>
          </div>

          <p className="text-sm text-brand-graphite-light">
            O LogiHub CRM é uma plataforma de gestão comercial que reúne captações, leads, propostas
            e todo o pipeline comercial necessário em um só lugar.
          </p>

          <div className="w-full border-t border-border pt-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
              Desenvolvido por
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">Fabiano F. Alarcon</p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-brand-graphite-light">
              <Icon name="call" size={16} />
              (12) 99161-7297
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-brand-graphite-light">
              <Icon name="mail" size={16} />
              fabiano.alarcon@gmail.com
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
