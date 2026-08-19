"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateParametrosNotificacao } from "../actions";
import type { ParametrosNotificacao } from "../types";

const FIELDS: { key: keyof ParametrosNotificacao; label: string; hint: string }[] = [
  {
    key: "diasLeadSemMovimentacao",
    label: "Dias sem movimentação — Leads",
    hint: "Alerta quando um Lead fica parado no mesmo estágio por mais tempo que isso.",
  },
  {
    key: "diasPropostaSemMovimentacao",
    label: "Dias sem movimentação — Propostas",
    hint: "Alerta quando uma Proposta fica parada no mesmo estágio por mais tempo que isso.",
  },
  {
    key: "diasEmpresaSemContato",
    label: "Dias sem contato cadastrado — Empresas",
    hint: "Alerta quando uma Empresa continua sem nenhum contato cadastrado.",
  },
  {
    key: "diasLeadSemAcao",
    label: "Dias sem ação — Leads",
    hint: "Alerta quando um Lead fica sem nenhuma Ação registrada.",
  },
  {
    key: "diasPropostaSemAcao",
    label: "Dias sem ação — Propostas",
    hint: "Alerta quando uma Proposta fica sem nenhuma Ação registrada.",
  },
];

export interface ParametrosNotificacaoFormProps {
  parametros: ParametrosNotificacao;
}

export function ParametrosNotificacaoForm({ parametros }: ParametrosNotificacaoFormProps) {
  const [values, setValues] = useState<ParametrosNotificacao>(parametros);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timeout = setTimeout(() => setJustSaved(false), 3000);
    return () => clearTimeout(timeout);
  }, [justSaved]);

  function update(key: keyof ParametrosNotificacao, value: number) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await updateParametrosNotificacao(values);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setJustSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <Input
              label={field.label}
              type="number"
              min={1}
              step={1}
              required
              value={values[field.key]}
              onChange={(e) => update(field.key, Number(e.target.value))}
            />
            <p className="text-xs text-brand-graphite-light">{field.hint}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-temp-quente">{error}</p>}

      <div className="mt-2 flex items-center justify-end gap-3">
        {justSaved && <span className="text-sm text-status-aprovado">Alterações salvas.</span>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
