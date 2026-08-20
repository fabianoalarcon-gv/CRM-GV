"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ORIGEM_LEAD_COLOR, ORIGEM_LEAD_LABEL } from "@/modules/empresas/constants";
import { deleteCaptacao, transformarCaptacaoEmLead } from "../actions";
import type { Captacao } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export interface CaptacaoListViewProps {
  captacoes: Captacao[];
}

export function CaptacaoListView({ captacoes }: CaptacaoListViewProps) {
  const [transforming, setTransforming] = useState<Captacao | null>(null);
  const [deleting, setDeleting] = useState<Captacao | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTransformar() {
    if (!transforming) return;
    setIsBusy(true);
    setError(null);
    const result = await transformarCaptacaoEmLead(transforming.id, transforming.empresaId);
    setIsBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setTransforming(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsBusy(true);
    setError(null);
    const result = await deleteCaptacao(deleting.id);
    setIsBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setDeleting(null);
  }

  function closeTransformar() {
    setTransforming(null);
    setError(null);
  }

  function closeDeleting() {
    setDeleting(null);
    setError(null);
  }

  if (captacoes.length === 0) {
    return <p className="text-sm text-brand-graphite-light">Nenhuma captação registrada.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Origem</TableHead>
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
                {captacao.origemLead ? (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${ORIGEM_LEAD_COLOR[captacao.origemLead]} 14%, transparent)`,
                      color: ORIGEM_LEAD_COLOR[captacao.origemLead],
                    }}
                  >
                    {ORIGEM_LEAD_LABEL[captacao.origemLead] ?? captacao.origemLead}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={captacao.temContato ? "success" : "danger"}>
                  {captacao.temContato ? "Sim" : "Não"}
                </Badge>
              </TableCell>
              <TableCell className="text-brand-graphite-light">
                {dateFormatter.format(new Date(captacao.createdAt))}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    title="Transformar em Lead"
                    onClick={() => {
                      setError(null);
                      setTransforming(captacao);
                    }}
                    className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-brand-accent"
                  >
                    <Icon name="person_add" size={18} />
                  </button>
                  <button
                    type="button"
                    title="Excluir"
                    onClick={() => {
                      setError(null);
                      setDeleting(captacao);
                    }}
                    className="rounded p-1.5 text-brand-graphite-light hover:bg-temp-quente/10 hover:text-temp-quente"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={transforming !== null}
        onClose={closeTransformar}
        title="Transformar em Lead"
        className="max-w-sm"
      >
        {transforming && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-brand-graphite-light">
              Transformar <span className="font-medium text-foreground">{transforming.empresaNome}</span>{" "}
              em Lead? O registro sairá da lista de Captação.
            </p>
            {error && <p className="text-sm text-temp-quente">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeTransformar}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleTransformar} disabled={isBusy}>
                {isBusy ? "Transformando…" : "Confirmar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={deleting !== null} onClose={closeDeleting} title="Excluir captação" className="max-w-sm">
        {deleting && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-brand-graphite-light">
              Excluir a captação de{" "}
              <span className="font-medium text-foreground">{deleting.empresaNome}</span>? Essa ação não
              pode ser desfeita.
            </p>
            {error && <p className="text-sm text-temp-quente">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeDeleting}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} disabled={isBusy}>
                {isBusy ? "Excluindo…" : "Excluir"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
