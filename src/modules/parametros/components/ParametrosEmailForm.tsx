"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NOTIFICACAO_TIPO_OPTIONS } from "@/modules/notificacoes/utils";
import type { NotificacaoTipo } from "@/modules/notificacoes/types";
import { updateParametrosEmail } from "../actions";
import type { ParametrosEmail } from "../types";

export interface ParametrosEmailFormProps {
  parametros: ParametrosEmail;
}

export function ParametrosEmailForm({ parametros }: ParametrosEmailFormProps) {
  const [values, setValues] = useState<ParametrosEmail>(parametros);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timeout = setTimeout(() => setJustSaved(false), 3000);
    return () => clearTimeout(timeout);
  }, [justSaved]);

  function toggleTipo(tipo: NotificacaoTipo, checked: boolean) {
    setValues((prev) => ({
      ...prev,
      tiposHabilitados: checked
        ? [...prev.tiposHabilitados, tipo]
        : prev.tiposHabilitados.filter((t) => t !== tipo),
    }));
    setJustSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await updateParametrosEmail(values);
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
            setValues((prev) => ({ ...prev, ativo: e.target.checked }));
            setJustSaved(false);
          }}
          className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
        />
        Envio de e-mails de notificação ativo
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nome do remetente"
          value={values.nomeRemetente}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, nomeRemetente: e.target.value }));
            setJustSaved(false);
          }}
          required
        />
        <div className="flex flex-col gap-1">
          <Input
            label="E-mail de teste"
            type="email"
            value={values.emailTeste ?? ""}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, emailTeste: e.target.value }));
              setJustSaved(false);
            }}
            placeholder="crm@granvale.com.br"
          />
          <p className="text-xs text-brand-graphite-light">
            Usado enquanto o modo teste estiver ativo, em vez do e-mail real do destinatário.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.modoTeste}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, modoTeste: e.target.checked }));
            setJustSaved(false);
          }}
          className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
        />
        Modo teste — envia tudo para o e-mail de teste, não para os usuários reais
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Eventos que disparam e-mail</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {NOTIFICACAO_TIPO_OPTIONS.map((tipo) => (
            <label key={tipo.value} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={values.tiposHabilitados.includes(tipo.value)}
                onChange={(e) => toggleTipo(tipo.value, e.target.checked)}
                className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
              />
              {tipo.label}
            </label>
          ))}
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
