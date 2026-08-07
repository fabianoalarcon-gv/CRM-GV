"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useIsAdmin } from "@/lib/auth/context";
import { usePipelineData } from "../context";
import { addProposalHistoryEntry, deleteProposal, updateProposal } from "../actions";
import { ProposalForm } from "./ProposalForm";
import type { Proposta } from "../types";

const TERMOMETRO_LABEL: Record<Proposta["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export interface ProposalDetailModalProps {
  proposta: Proposta;
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalDetailModal({ proposta, isOpen, onClose }: ProposalDetailModalProps) {
  const { history, statuses, profiles } = usePipelineData();
  const isAdmin = useIsAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const statusLabel = statuses.find((s) => s.id === proposta.status_id)?.label ?? "—";
  const responsavelNome = profiles.find((p) => p.id === proposta.responsavel_id)?.full_name;
  const entries = history.filter((h) => h.proposta_id === proposta.id);

  function handleClose() {
    setIsEditing(false);
    setConfirmingDelete(false);
    setNoteText("");
    setNoteError(null);
    setDeleteError(null);
    onClose();
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setIsSavingNote(true);
    setNoteError(null);
    const result = await addProposalHistoryEntry(proposta.id, noteText);
    setIsSavingNote(false);

    if (result.error) {
      setNoteError(result.error);
      return;
    }
    setNoteText("");
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteProposal(proposta.id);
    setIsDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    handleClose();
  }

  if (isEditing) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Editar proposta ${proposta.numero_proposta}`}
        className="max-w-2xl"
      >
        <ProposalForm
          initialValues={{
            numero_proposta: proposta.numero_proposta,
            data_envio: proposta.data_envio,
            cliente_id: proposta.cliente_id,
            servico: proposta.servico ?? "",
            descricao: proposta.descricao ?? "",
            valor: proposta.valor,
            status_id: proposta.status_id,
            termometro: proposta.termometro,
            tipo_servico: proposta.tipo_servico,
            responsavel_id: proposta.responsavel_id,
            resultado: proposta.resultado,
          }}
          submitLabel="Salvar alterações"
          onSubmit={(input) => updateProposal(proposta.id, input)}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={proposta.numero_proposta}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{proposta.cliente_nome}</p>
            <p className="text-sm text-brand-graphite-light">
              {proposta.servico || "Serviço não informado"}
            </p>
          </div>
          <Badge variant={proposta.termometro}>{TERMOMETRO_LABEL[proposta.termometro]}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-brand-graphite-light">Valor</dt>
            <dd className="font-mono font-semibold text-foreground">
              {currencyFormatter.format(proposta.valor)}
            </dd>
          </div>
          <div>
            <dt className="text-brand-graphite-light">Status</dt>
            <dd className="text-foreground">
              {statusLabel}
              {proposta.resultado && (
                <Badge
                  variant={proposta.resultado === "aprovado" ? "success" : "danger"}
                  className="ml-2"
                >
                  {proposta.resultado === "aprovado" ? "Aprovado" : "Reprovado"}
                </Badge>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-brand-graphite-light">Tipo</dt>
            <dd className="text-foreground">
              {proposta.tipo_servico === "fixo" ? "Fixo" : "Spot"}
            </dd>
          </div>
          <div>
            <dt className="text-brand-graphite-light">Data de envio</dt>
            <dd className="text-foreground">
              {dateFormatter.format(new Date(`${proposta.data_envio}T00:00:00`))}
            </dd>
          </div>
          <div>
            <dt className="text-brand-graphite-light">Responsável</dt>
            <dd className="text-foreground">{responsavelNome ?? "—"}</dd>
          </div>
        </dl>

        {proposta.descricao && (
          <div>
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Descrição
            </p>
            <p className="mt-1 text-sm text-foreground">{proposta.descricao}</p>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
            Observações
          </p>

          <div className="mt-2 flex max-h-48 flex-col gap-3 overflow-y-auto pr-1">
            {entries.length === 0 && (
              <p className="text-sm text-brand-graphite-light">
                Nenhuma observação registrada ainda.
              </p>
            )}
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-black/[.02] p-2.5 text-sm">
                <p className="text-foreground">{entry.texto}</p>
                <p className="mt-1 text-xs text-brand-graphite-light">
                  {entry.autor_nome ?? "Desconhecido"} ·{" "}
                  {dateTimeFormatter.format(new Date(entry.created_at))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Textarea
              placeholder="Adicionar uma observação..."
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            {noteError && <p className="text-sm text-temp-quente">{noteError}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-end"
              disabled={isSavingNote || !noteText.trim()}
              onClick={handleAddNote}
            >
              {isSavingNote ? "Salvando…" : "Adicionar observação"}
            </Button>
          </div>
        </div>

        {isAdmin && deleteError && <p className="text-sm text-temp-quente">{deleteError}</p>}

        <div className="flex items-center justify-between border-t border-border pt-4">
          {isAdmin ? (
            confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-graphite-light">Excluir esta proposta?</span>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? "Excluindo…" : "Confirmar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(true)}
              >
                Excluir
              </Button>
            )
          ) : (
            <span />
          )}
          <Button type="button" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
