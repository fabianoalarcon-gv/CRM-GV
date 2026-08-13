"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Input } from "@/components/ui/Input";
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
  numeroLead?: string | null;
  initialValues: LeadInput;
  submitLabel: string;
  onSubmit: (input: LeadInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeadForm({ numeroLead, initialValues, submitLabel, onSubmit, onSuccess, onCancel }: LeadFormProps) {
  const { statuses, empresas, profiles } = useLeadsData();
  const [values, setValues] = useState<LeadInput>(initialValues);
  const [empresaError, setEmpresaError] = useState<string | null>(null);
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
    if (key === "empresa_id") setEmpresaError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!values.empresa_id) {
      setEmpresaError("Selecione a empresa.");
      return;
    }
    setEmpresaError(null);

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Número Lead" value={numeroLead ?? "Gerado automaticamente"} disabled />
        <Input
          label="Data Início Lead"
          type="date"
          value={values.data_inicio_lead}
          onChange={(e) => update("data_inicio_lead", e.target.value)}
        />
      </div>

      <Combobox
        label="Empresa"
        placeholder="Selecione uma empresa"
        value={values.empresa_id ? String(values.empresa_id) : ""}
        onChange={(v) => update("empresa_id", Number(v))}
        options={empresas.map((c) => ({ value: String(c.id), label: c.nome }))}
        error={empresaError ?? undefined}
      />

      <Textarea
        label="Descrição do Lead"
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
          label="Segmento"
          placeholder="Sem segmento"
          value={values.segmento ?? ""}
          onChange={(e) => update("segmento", (e.target.value || null) as LeadInput["segmento"])}
          options={SEGMENTO_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CurrencyInput
          label="Valor Estimado"
          value={values.valor_estimado}
          onChange={(v) => update("valor_estimado", v)}
        />
        <Select
          label="Status"
          value={String(values.status_id)}
          onChange={(e) => update("status_id", Number(e.target.value))}
          // Arquivado só entra na lista quando já é o status atual (senão vira
          // atalho pra arquivar sem confirmação, driblando o botão Arquivar).
          options={statuses
            .filter((s) => s.key !== "arquivado" || s.id === initialValues.status_id)
            .map((s) => ({ value: String(s.id), label: s.label }))}
        />
      </div>

      <Select
        label="Responsável"
        placeholder="Sem responsável definido"
        value={values.responsavel_id ?? ""}
        onChange={(e) => update("responsavel_id", e.target.value || null)}
        options={profiles.map((p) => ({ value: p.id, label: p.full_name }))}
      />

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
