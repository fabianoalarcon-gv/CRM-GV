"use client";

import { Modal } from "@/components/ui/Modal";
import { TIPO_COLOR, TIPO_LABEL } from "../utils";
import type { Compromisso } from "../types";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dateLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  weekday: "long",
});

export interface TodayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  compromissos: Compromisso[];
}

export function TodayEventsModal({ isOpen, onClose, date, compromissos }: TodayEventsModalProps) {
  const sorted = [...compromissos].sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compromissos de hoje" className="max-w-lg">
      <p className="-mt-2 mb-4 text-sm text-brand-graphite-light capitalize">
        {dateLabelFormatter.format(date)}
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-brand-graphite-light">Nenhum compromisso para hoje.</p>
      ) : (
        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
          {sorted.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-black/[.02] p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                  {c.tipo && (
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${TIPO_COLOR[c.tipo]} 15%, transparent)`,
                        color: TIPO_COLOR[c.tipo],
                      }}
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: TIPO_COLOR[c.tipo] }}
                      />
                      {TIPO_LABEL[c.tipo]}
                    </span>
                  )}
                  <p className="font-medium text-foreground">{c.titulo}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-brand-graphite-light">
                  <p>Início: {timeFormatter.format(new Date(c.inicio))}</p>
                  {c.fim && <p>Fim: {timeFormatter.format(new Date(c.fim))}</p>}
                </div>
              </div>

              {c.empresa_nome && (
                <p className="mt-2">
                  <span className="font-semibold text-foreground">Empresa:</span>{" "}
                  <span className="text-brand-graphite-light">{c.empresa_nome}</span>
                </p>
              )}
              {c.descricao && (
                <p className="mt-1 whitespace-pre-wrap text-brand-graphite-light">{c.descricao}</p>
              )}
              {c.criado_por_nome && (
                <p className="mt-1 text-xs text-brand-graphite-light">
                  Criado por {c.criado_por_nome}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
