"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { EmpresaOption, CompromissoInput } from "../types";
import { ACAO_TIPO_OPTIONS } from "../utils";

export interface CompromissoFormProps {
  initialValues: CompromissoInput;
  empresas: EmpresaOption[];
  submitLabel: string;
  onSubmit: (input: CompromissoInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CompromissoForm({
  initialValues,
  empresas,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
}: CompromissoFormProps) {
  const [values, setValues] = useState<CompromissoInput>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof CompromissoInput>(key: K, value: CompromissoInput[K]) {
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
        label="Título"
        required
        value={values.titulo}
        onChange={(e) => update("titulo", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Início"
          type="datetime-local"
          required
          value={values.inicio}
          onChange={(e) => update("inicio", e.target.value)}
        />
        <Input
          label="Fim"
          type="datetime-local"
          value={values.fim}
          onChange={(e) => update("fim", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Categoria"
          value={values.tipo}
          onChange={(e) => update("tipo", e.target.value as CompromissoInput["tipo"])}
          options={ACAO_TIPO_OPTIONS}
        />
        <Select
          label="Empresa"
          placeholder="Sem empresa vinculada"
          value={values.empresa_id ? String(values.empresa_id) : ""}
          onChange={(e) => update("empresa_id", e.target.value ? Number(e.target.value) : null)}
          options={empresas.map((c) => ({ value: String(c.id), label: c.nome }))}
        />
      </div>

      <Textarea
        label="Descrição"
        value={values.descricao}
        onChange={(e) => update("descricao", e.target.value)}
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
