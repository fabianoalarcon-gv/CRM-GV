"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateParametrosAuditoria } from "../actions";
import type { ParametrosAuditoria } from "../types";

export interface ParametrosAuditoriaFormProps {
  parametros: ParametrosAuditoria;
}

export function ParametrosAuditoriaForm({ parametros }: ParametrosAuditoriaFormProps) {
  const [values, setValues] = useState<ParametrosAuditoria>(parametros);
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
    const result = await updateParametrosAuditoria(values);
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
        <div className="flex flex-col gap-1">
          <Input
            label="Dias de retenção"
            type="number"
            min={1}
            step={1}
            required
            value={values.diasRetencao}
            onChange={(e) => {
              setValues({ diasRetencao: Number(e.target.value) });
              setJustSaved(false);
            }}
          />
          <p className="text-xs text-brand-graphite-light">
            Registros do log de auditoria com mais de X dias são apagados automaticamente todo dia.
          </p>
        </div>
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
