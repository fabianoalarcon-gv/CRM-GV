"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { SEGMENTO_LABEL, SEGMENTO_OPTIONS, type Segmento } from "../types";

const MAX_SEGMENTOS = 3;

export interface SegmentoFieldProps {
  value: Segmento[];
  onChange: (value: Segmento[]) => void;
}

// Campo de "adicionar segmento" com chips removíveis, em vez do Select de
// valor único de antes — permite escolher de 0 a 3 dos segmentos fixos
// (Transporte, Armazenagem, Serviço), sem repetir o mesmo. Compartilhado
// pelos formulários de Proposta e de Lead.
export function SegmentoField({ value, onChange }: SegmentoFieldProps) {
  const [isPicking, setIsPicking] = useState(false);
  const available = SEGMENTO_OPTIONS.filter((o) => !value.includes(o.value));

  function add(segmento: Segmento) {
    onChange([...value, segmento]);
    setIsPicking(false);
  }

  function remove(segmento: Segmento) {
    onChange(value.filter((v) => v !== segmento));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">Segmento</label>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((s) => (
          <Badge key={s} variant="default" className="gap-1 py-1 pr-1.5">
            {SEGMENTO_LABEL[s]}
            <button
              type="button"
              onClick={() => remove(s)}
              aria-label={`Remover ${SEGMENTO_LABEL[s]}`}
              className="rounded-full hover:bg-black/[.08]"
            >
              <Icon name="close" size={14} />
            </button>
          </Badge>
        ))}

        {value.length < MAX_SEGMENTOS &&
          (isPicking ? (
            <select
              autoFocus
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) add(e.target.value as Segmento);
              }}
              onBlur={() => setIsPicking(false)}
              className="h-8 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <option value="" disabled>
                Selecione…
              </option>
              {available.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <button
              type="button"
              onClick={() => setIsPicking(true)}
              className="flex h-8 items-center gap-1 rounded-lg border border-dashed border-border px-2.5 text-sm text-brand-graphite-light hover:border-brand-accent hover:text-brand-accent"
            >
              <Icon name="add" size={16} />
              Adicionar segmento
            </button>
          ))}
      </div>
    </div>
  );
}
