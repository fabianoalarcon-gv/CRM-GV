"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ClienteInput } from "../types";

export interface ClienteFormProps {
  initialValues: ClienteInput;
  submitLabel: string;
  onSubmit: (input: ClienteInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClienteForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
}: ClienteFormProps) {
  const [values, setValues] = useState<ClienteInput>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ClienteInput>(key: K, value: ClienteInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    setIsSubmitting(true);
    const result = await onSubmit(values);
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome"
        placeholder="Razão social ou nome fantasia"
        required
        value={values.nome}
        onChange={(e) => update("nome", e.target.value)}
      />

      <Input
        label="Setor"
        placeholder="Ex: Automotivo, Offshore, Químico..."
        value={values.setor}
        onChange={(e) => update("setor", e.target.value)}
      />

      <Input
        label="Endereço"
        value={values.endereco}
        onChange={(e) => update("endereco", e.target.value)}
      />

      <Textarea
        label="Observações"
        value={values.observacoes}
        onChange={(e) => update("observacoes", e.target.value)}
      />

      {formError && <p className="text-sm text-temp-quente">{formError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
