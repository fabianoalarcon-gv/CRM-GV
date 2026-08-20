"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createAtualizacao } from "../actions";
import type { AtualizacaoInput } from "../types";

const EMPTY_VALUES: AtualizacaoInput = { numeroPatch: "", dataHora: "" };

export function NovaAtualizacaoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<AtualizacaoInput>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function close() {
    setIsOpen(false);
    setValues(EMPTY_VALUES);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await createAtualizacao(values);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    close();
  }

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        + Nova Atualização
      </Button>

      <Modal isOpen={isOpen} onClose={close} title="Nova atualização" className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Número do Patch"
            required
            value={values.numeroPatch}
            onChange={(e) => setValues((prev) => ({ ...prev, numeroPatch: e.target.value }))}
          />
          <Input
            label="Data/Hora da Atualização"
            type="datetime-local"
            required
            value={values.dataHora}
            onChange={(e) => setValues((prev) => ({ ...prev, dataHora: e.target.value }))}
          />
          {error && <p className="text-sm text-temp-quente">{error}</p>}
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
