"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { createCliente } from "../actions";
import { ClienteForm } from "./ClienteForm";
import type { ClienteInput } from "../types";

const EMPTY_VALUES: ClienteInput = {
  nome: "",
  setor: "",
  endereco: "",
  observacoes: "",
};

export function NewClienteButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} className="gap-1.5">
        <Icon name="add_business" size={18} />
        Nova Empresa
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova empresa" className="max-w-lg">
        <ClienteForm
          initialValues={EMPTY_VALUES}
          submitLabel="Criar cliente"
          onSubmit={createCliente}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
