"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { updateParametrosGoogleCalendar } from "../actions";
import type { ParametrosGoogleCalendar } from "../types";

export interface ParametrosGoogleCalendarFormProps {
  parametros: ParametrosGoogleCalendar;
}

export function ParametrosGoogleCalendarForm({ parametros }: ParametrosGoogleCalendarFormProps) {
  const [values, setValues] = useState<ParametrosGoogleCalendar>(parametros);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timeout = setTimeout(() => setJustSaved(false), 3000);
    return () => clearTimeout(timeout);
  }, [justSaved]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await updateParametrosGoogleCalendar(values);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setJustSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.ativo}
          onChange={(e) => {
            setValues({ ativo: e.target.checked });
            setJustSaved(false);
          }}
          className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
        />
        Sincronização de Ações com o Google Calendar ativa
      </label>
      <p className="text-xs text-brand-graphite-light">
        Quando ativo, toda Ação criada, editada ou excluída no CRM é refletida no Google Calendar do
        usuário responsável (ou de crm@granvale.com.br, quando não há um responsável).
      </p>

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
