"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getHasUnseenAtualizacoes, markAtualizacoesAsSeen } from "@/modules/atualizacoes/actions";
import { AtualizacoesModal } from "@/modules/atualizacoes/components/AtualizacoesModal";

const POLL_INTERVAL_MS = 30_000;

export function UpdatesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  const refresh = useCallback(async () => {
    setHasUnseen(await getHasUnseenAtualizacoes());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleOpen() {
    setIsOpen(true);
    if (hasUnseen) {
      await markAtualizacoesAsSeen();
      setHasUnseen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Atualizações"
        aria-label={hasUnseen ? "Atualizações — há novidades" : "Atualizações"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04]"
      >
        <Icon name="campaign" />
        {hasUnseen && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-temp-quente ring-2 ring-surface" />
        )}
      </button>

      <AtualizacoesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
