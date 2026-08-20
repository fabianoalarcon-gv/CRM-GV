"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { EmpresaOption } from "@/modules/pipeline/types";
import { createCaptacao } from "../actions";

export interface NovaCaptacaoButtonProps {
  empresas: EmpresaOption[];
}

export function NovaCaptacaoButton({ empresas }: NovaCaptacaoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [empresaId, setEmpresaId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function close() {
    setIsOpen(false);
    setEmpresaId("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaId) {
      setError("Selecione a empresa.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await createCaptacao(Number(empresaId));
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    close();
  }

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} className="gap-1.5">
        <Icon name="add_business" size={18} />
        Nova Captação
      </Button>

      <Modal isOpen={isOpen} onClose={close} title="Nova captação" className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Combobox
            label="Empresa"
            placeholder="Selecione uma empresa"
            value={empresaId}
            onChange={setEmpresaId}
            options={empresas.map((e) => ({ value: String(e.id), label: e.nome }))}
            error={error ?? undefined}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando…" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
