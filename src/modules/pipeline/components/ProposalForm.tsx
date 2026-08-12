"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { usePipelineData } from "../context";
import { isValidNumeroProposta, NUMERO_PROPOSTA_HINT } from "../validation";
import type { ProposalInput, Termometro, TipoServico } from "../types";

const TERMOMETRO_OPTIONS = [
  { value: "frio", label: "Frio" },
  { value: "morno", label: "Morno" },
  { value: "quente", label: "Quente" },
];

const TIPO_SERVICO_OPTIONS = [
  { value: "fixo", label: "Fixo" },
  { value: "spot", label: "Spot" },
];

const RESULTADO_OPTIONS = [
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
];

export interface ProposalFormProps {
  initialValues: ProposalInput;
  submitLabel: string;
  onSubmit: (input: ProposalInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
  /** "create" esconde Número da proposta — o sistema gera sozinho. */
  mode?: "create" | "edit";
}

export function ProposalForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
  mode = "edit",
}: ProposalFormProps) {
  const { statuses, clientes, profiles } = usePipelineData();
  const [values, setValues] = useState<ProposalInput>(initialValues);
  const [numeroError, setNumeroError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timeout = setTimeout(() => setJustSaved(false), 3000);
    return () => clearTimeout(timeout);
  }, [justSaved]);

  function update<K extends keyof ProposalInput>(key: K, value: ProposalInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
  }

  const selectedStatus = statuses.find((s) => s.id === values.status_id);
  const isFechado = selectedStatus?.key === "fechado";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (mode === "edit" && !isValidNumeroProposta(values.numero_proposta)) {
      setNumeroError(NUMERO_PROPOSTA_HINT);
      return;
    }
    setNumeroError(null);

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
      <div className={mode === "edit" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : undefined}>
        {mode === "edit" && (
          <Input
            label="Número da proposta"
            placeholder="028/25"
            required
            value={values.numero_proposta}
            error={numeroError ?? undefined}
            onChange={(e) => update("numero_proposta", e.target.value)}
          />
        )}
        <Input
          label="Data de envio"
          type="date"
          required
          value={values.data_envio}
          onChange={(e) => update("data_envio", e.target.value)}
        />
      </div>

      <Select
        label="Cliente"
        required
        placeholder="Selecione um cliente"
        value={values.cliente_id ? String(values.cliente_id) : ""}
        onChange={(e) => update("cliente_id", Number(e.target.value))}
        options={clientes.map((c) => ({ value: String(c.id), label: c.nome }))}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Serviço"
          placeholder="Ex: Armazenagem, Transportes..."
          value={values.servico}
          onChange={(e) => update("servico", e.target.value)}
        />
        <Input
          label="Valor (R$)"
          type="number"
          min="0"
          step="0.01"
          required
          value={values.valor}
          onChange={(e) => update("valor", Number(e.target.value))}
        />
      </div>

      <Textarea
        label="Descrição"
        value={values.descricao}
        onChange={(e) => update("descricao", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label="Status"
          value={String(values.status_id)}
          onChange={(e) => update("status_id", Number(e.target.value))}
          options={statuses.map((s) => ({ value: String(s.id), label: s.label }))}
        />
        <Select
          label="Termômetro"
          value={values.termometro}
          onChange={(e) => update("termometro", e.target.value as Termometro)}
          options={TERMOMETRO_OPTIONS}
        />
        <Select
          label="Tipo"
          value={values.tipo_servico}
          onChange={(e) => update("tipo_servico", e.target.value as TipoServico)}
          options={TIPO_SERVICO_OPTIONS}
        />
      </div>

      <Select
        label="Responsável"
        placeholder="Sem responsável definido"
        value={values.responsavel_id ?? ""}
        onChange={(e) => update("responsavel_id", e.target.value || null)}
        options={profiles.map((p) => ({ value: p.id, label: p.full_name }))}
      />

      {isFechado && (
        <Select
          label="Resultado"
          placeholder="Ainda não decidido"
          value={values.resultado ?? ""}
          onChange={(e) => update("resultado", (e.target.value || null) as ProposalInput["resultado"])}
          options={RESULTADO_OPTIONS}
        />
      )}

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
