"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { createEmpresa } from "../actions";
import { EmpresaForm } from "./EmpresaForm";
import type { EmpresaInput } from "../types";

const EMPTY_VALUES: EmpresaInput = {
  nome: "",
  cnpj: "",
  setor: "",
  endereco: "",
  numero: "",
  cidade: "",
  uf: "",
  cep: "",
  observacoes: "",
};

export function NewEmpresaButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} className="gap-1.5">
        <Icon name="add_business" size={18} />
        Nova Empresa
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova empresa" className="max-w-2xl">
        <EmpresaForm
          initialValues={EMPTY_VALUES}
          submitLabel="Criar empresa"
          onSubmit={createEmpresa}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
