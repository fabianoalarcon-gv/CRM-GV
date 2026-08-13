"use client";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export interface HistoricoEntry {
  id: number;
  texto: string;
  autor_nome: string | null;
  created_at: string;
}

export function HistoricoSection({
  title,
  entries,
  text,
  onTextChange,
  onSubmit,
  isSaving,
  error,
}: {
  title: string;
  entries: HistoricoEntry[];
  text: string;
  onTextChange: (value: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  return (
    <div className="border-t border-border pt-4">
      <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">{title}</p>

      <div className="mt-2 flex max-h-48 flex-col gap-3 overflow-y-auto pr-1">
        {entries.length === 0 && (
          <p className="text-sm text-brand-graphite-light">Nenhum registro ainda.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg bg-black/[.02] p-2.5 text-sm">
            <p className="text-foreground">{entry.texto}</p>
            <p className="mt-1 text-xs text-brand-graphite-light">
              {entry.autor_nome ?? "Desconhecido"} · {dateTimeFormatter.format(new Date(entry.created_at))}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Textarea
          placeholder={`Adicionar ${title.toLowerCase()}...`}
          rows={2}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
        {error && <p className="text-sm text-temp-quente">{error}</p>}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-end"
          disabled={isSaving || !text.trim()}
          onClick={onSubmit}
        >
          {isSaving ? "Salvando…" : `Adicionar ${title.toLowerCase()}`}
        </Button>
      </div>
    </div>
  );
}
