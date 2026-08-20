"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { getAllAtualizacoes } from "../actions";
import { TIPO_BADGE_VARIANT, TIPO_LABEL } from "../constants";
import type { Atualizacao } from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export interface AtualizacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AtualizacoesModal({ isOpen, onClose }: AtualizacoesModalProps) {
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const data = await getAllAtualizacoes();
      if (cancelled) return;
      setAtualizacoes(data);
      setSelectedId(data[0]?.id ?? null);
      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const selected = atualizacoes.find((a) => a.id === selectedId) ?? null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atualizações do Sistema" className="!max-w-6xl">
      {isLoading ? (
        <p className="text-sm text-brand-graphite-light">Carregando…</p>
      ) : atualizacoes.length === 0 ? (
        <p className="text-sm text-brand-graphite-light">Nenhuma atualização cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-6">
          <div className="h-[60vh] overflow-y-auto border-r border-border pr-3">
            <ul className="flex flex-col gap-1">
              {atualizacoes.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left transition-colors",
                      a.id === selectedId
                        ? "bg-brand-accent/10 text-brand-navy"
                        : "text-foreground hover:bg-black/[.03]",
                    )}
                  >
                    <p className="text-sm font-semibold">Patch {a.numeroPatch}</p>
                    <p className="text-xs text-brand-graphite-light">
                      {dateTimeFormatter.format(new Date(a.dataHora))}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-[60vh] overflow-y-auto pl-1">
            {!selected || selected.itens.length === 0 ? (
              <p className="text-sm text-brand-graphite-light">Nenhum item cadastrado nesta atualização.</p>
            ) : (
              <ul className="flex flex-col gap-3 pr-2">
                {selected.itens.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <div className="flex items-baseline gap-2">
                        <Badge variant={TIPO_BADGE_VARIANT[item.tipo]}>{TIPO_LABEL[item.tipo]}</Badge>
                        <span className="text-sm font-medium text-foreground">{item.local}</span>
                      </div>
                      {item.numeroChamado && (
                        <span className="text-xs text-brand-graphite-light">
                          Nº Chamado: {item.numeroChamado}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-brand-graphite-light">{item.descricao}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
