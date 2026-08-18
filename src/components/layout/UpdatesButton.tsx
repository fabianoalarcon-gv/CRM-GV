"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

export function UpdatesButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Atualizações"
        aria-label="Atualizações"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04]"
      >
        <Icon name="campaign" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Atualizações do Sistema">
        <p className="text-sm text-brand-graphite-light">Atualizações futuras</p>
      </Modal>
    </>
  );
}
