"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { EmpresaInput } from "../types";

export interface EmpresaFormProps {
  initialValues: EmpresaInput;
  submitLabel: string;
  onSubmit: (input: EmpresaInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmpresaForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
}: EmpresaFormProps) {
  const [values, setValues] = useState<EmpresaInput>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof EmpresaInput>(key: K, value: EmpresaInput[K]) {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Empresa"
          placeholder="Razão social ou nome fantasia"
          required
          value={values.nome}
          onChange={(e) => update("nome", e.target.value)}
        />

        <Input
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          value={values.cnpj}
          onChange={(e) => update("cnpj", e.target.value)}
        />
      </div>

      <Input
        label="Setor"
        placeholder="Ex: Automotivo, Offshore, Químico..."
        required
        value={values.setor}
        onChange={(e) => update("setor", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Endereço"
          value={values.endereco}
          onChange={(e) => update("endereco", e.target.value)}
        />

        <Input
          label="Número"
          value={values.numero}
          onChange={(e) => update("numero", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Cidade"
          value={values.cidade}
          onChange={(e) => update("cidade", e.target.value)}
        />

        <Input
          label="UF"
          placeholder="Ex: SP"
          maxLength={2}
          value={values.uf}
          onChange={(e) => update("uf", e.target.value.toUpperCase())}
        />

        <Input
          label="CEP"
          placeholder="00000-000"
          value={values.cep}
          onChange={(e) => update("cep", e.target.value)}
        />
      </div>

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
