"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { TIPO_OPTIONS } from "@/modules/calendario/utils";
import type { AcaoInput, Repeticao } from "../types";

const REPETICAO_OPTIONS: { value: Repeticao; label: string }[] = [
  { value: "nao_repete", label: "Não se repete" },
  { value: "diaria", label: "Todos os dias" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
  { value: "dias_uteis", label: "Segunda a Sexta" },
];

// Trava de segurança contra um número digitado por engano (ex: "9999")
// gerando uma quantidade absurda de ocorrências de uma vez.
const MAX_REPETICOES = 100;

export interface AcaoFormProps {
  clienteNome: string;
  initialValues: AcaoInput;
  onSubmit: (input: AcaoInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AcaoForm({ clienteNome, initialValues, onSubmit, onSuccess, onCancel }: AcaoFormProps) {
  const [values, setValues] = useState<AcaoInput>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof AcaoInput>(key: K, value: AcaoInput[K]) {
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
          onChange={(e) => update("tipo", e.target.value as AcaoInput["tipo"])}
          options={TIPO_OPTIONS}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Cliente</span>
          <p className="flex h-10 items-center rounded-lg border border-border bg-black/[.02] px-3 text-sm text-brand-graphite-light">
            {clienteNome}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Repetir"
          value={values.repeticao}
          onChange={(e) => update("repeticao", e.target.value as Repeticao)}
          options={REPETICAO_OPTIONS}
        />
        {values.repeticao !== "nao_repete" && (
          <Input
            label="Quantidade de repetições"
            type="number"
            min={1}
            max={MAX_REPETICOES}
            step={1}
            required
            value={values.quantidadeRepeticoes}
            onChange={(e) => {
              const parsed = Math.trunc(Number(e.target.value));
              const clamped = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), MAX_REPETICOES) : 1;
              update("quantidadeRepeticoes", clamped);
            }}
          />
        )}
      </div>

      <Textarea
        label="Descrição da ação"
        value={values.descricao}
        onChange={(e) => update("descricao", e.target.value)}
      />

      {formError && <p className="text-sm text-temp-quente">{formError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : "Criar ação"}
        </Button>
      </div>
    </form>
  );
}
