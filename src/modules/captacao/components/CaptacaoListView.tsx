"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { deleteCaptacao, transformarCaptacaoEmLead } from "../actions";
import type { Captacao } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export interface CaptacaoListViewProps {
  captacoes: Captacao[];
}

export function CaptacaoListView({ captacoes }: CaptacaoListViewProps) {
  const [transformingId, setTransformingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);

  async function handleTransformar(captacao: Captacao) {
    setIsBusy(true);
    setRowError(null);
    const result = await transformarCaptacaoEmLead(captacao.id, captacao.empresaId);
    setIsBusy(false);
    setTransformingId(null);

    if (result.error) {
      setRowError({ id: captacao.id, message: result.error });
    }
  }

  async function handleDelete(id: number) {
    setIsBusy(true);
    setRowError(null);
    const result = await deleteCaptacao(id);
    setIsBusy(false);

    if (result.error) {
      setRowError({ id, message: result.error });
      return;
    }
    setDeletingId(null);
  }

  if (captacoes.length === 0) {
    return <p className="text-sm text-brand-graphite-light">Nenhuma captação registrada.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Setor</TableHead>
          <TableHead>Cidade</TableHead>
          <TableHead>UF</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Data de Inclusão</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {captacoes.map((captacao) => (
          <TableRow key={captacao.id}>
            <TableCell className="font-medium">{captacao.empresaNome}</TableCell>
            <TableCell className="text-brand-graphite-light">{captacao.setor ?? "—"}</TableCell>
            <TableCell className="text-brand-graphite-light">{captacao.cidade ?? "—"}</TableCell>
            <TableCell className="text-brand-graphite-light">{captacao.uf ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={captacao.temContato ? "success" : "danger"}>
                {captacao.temContato ? "Sim" : "Não"}
              </Badge>
            </TableCell>
            <TableCell className="text-brand-graphite-light">
              {dateFormatter.format(new Date(captacao.createdAt))}
            </TableCell>
            <TableCell>
              {deletingId === captacao.id ? (
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <span className="text-xs text-brand-graphite-light">Excluir?</span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDelete(captacao.id)}
                    className="text-xs font-medium text-temp-quente hover:underline"
                  >
                    {isBusy ? "Excluindo…" : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(null)}
                    className="text-xs font-medium text-brand-graphite-light hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : transformingId === captacao.id ? (
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <span className="text-xs text-brand-graphite-light">Transformar em Lead?</span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleTransformar(captacao)}
                    className="text-xs font-medium text-brand-accent hover:underline"
                  >
                    {isBusy ? "Transformando…" : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransformingId(null)}
                    className="text-xs font-medium text-brand-graphite-light hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    title="Transformar em Lead"
                    onClick={() => {
                      setRowError(null);
                      setTransformingId(captacao.id);
                    }}
                    className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-brand-accent"
                  >
                    <Icon name="person_add" size={18} />
                  </button>
                  <button
                    type="button"
                    title="Excluir"
                    onClick={() => {
                      setRowError(null);
                      setDeletingId(captacao.id);
                    }}
                    className="rounded p-1.5 text-brand-graphite-light hover:bg-temp-quente/10 hover:text-temp-quente"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              )}
              {rowError?.id === captacao.id && (
                <p className="mt-1 text-right text-xs text-temp-quente">{rowError.message}</p>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
