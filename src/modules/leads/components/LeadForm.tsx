"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { SEGMENTO_OPTIONS, type Termometro } from "@/modules/pipeline/types";
import { useLeadsData } from "../context";
import type { LeadInput } from "../types";

const TERMOMETRO_OPTIONS: { value: Termometro; label: string }[] = [
  { value: "frio", label: "Frio" },
  { value: "morno", label: "Morno" },
  { value: "quente", label: "Quente" },
];

export interface LeadFormProps {
  initialValues: LeadInput;
  submitLabel: string;
  onSubmit: (input: LeadInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeadForm({ initialValues, submitLabel, onSubmit, onSuccess, onCancel }: LeadFormProps) {
  const { statuses, clientes } = useLeadsData();
  const [values, setValues] = useState<LeadInput>(initialValues);
  const [clienteError, setClienteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timeout = setTimeout(() => setJustSaved(false), 3000);
    return () => clearTimeout(timeout);
  }, [justSaved]);

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
    if (key === "cliente_id") setClienteError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!values.cliente_id) {
      setClienteError("Selecione a empresa.");
      return;
    }
    setClienteError(null);

    setIsSubmitting(true);
    const result = await onSubmit(values);
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setJustSaved(true);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Combobox
        label="Empresa"
        required
        placeholder="Selecione um cliente"
        value={values.cliente_id ? String(values.cliente_id) : ""}
        onChange={(v) => update("cliente_id", Number(v))}
        options={clientes.map((c) => ({ value: String(c.id), label: c.nome }))}
        error={clienteError ?? undefined}
      />

      <Textarea
        label="Descrição do lead"
        value={values.descricao}
        onChange={(e) => update("descricao", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Termômetro"
          value={values.termometro}
          onChange={(e) => update("termometro", e.target.value as Termometro)}
          options={TERMOMETRO_OPTIONS}
        />
        <Select
          label="Segmento proposta"
          placeholder="Sem segmento"
          value={values.segmento ?? ""}
          onChange={(e) => update("segmento", (e.target.value || null) as LeadInput["segmento"])}
          options={SEGMENTO_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CurrencyInput
          label="Valor estimado"
          value={values.valor_estimado}
          onChange={(v) => update("valor_estimado", v)}
        />
        <Select
          label="Status"
          value={String(values.status_id)}
          onChange={(e) => update("status_id", Number(e.target.value))}
          options={statuses.map((s) => ({ value: String(s.id), label: s.label }))}
        />
      </div>

      {formError && <p className="text-sm text-temp-quente">{formError}</p>}

      <div className="mt-2 flex items-center justify-end gap-3">
        {justSaved && <span className="text-sm text-status-aprovado">Alterações salvas.</span>}
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
