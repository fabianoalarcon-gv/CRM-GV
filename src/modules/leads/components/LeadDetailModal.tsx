"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useIsAdmin } from "@/lib/auth/context";
import { deleteProposal, addProposalHistoryEntry } from "@/modules/pipeline/actions";
import { SEGMENTO_LABEL, type Proposta } from "@/modules/pipeline/types";
import { TIPO_COLOR, TIPO_LABEL, toDatetimeLocalValue } from "@/modules/calendario/utils";
import { useLeadsData } from "../context";
import { createAcao, updateLead } from "../actions";
import type { AcaoInput, LeadInput } from "../types";
import { LeadForm } from "./LeadForm";
import { AcaoForm } from "./AcaoForm";

const TERMOMETRO_LABEL: Record<Proposta["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export interface LeadDetailModalProps {
  proposta: Proposta;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailModal({ proposta, isOpen, onClose }: LeadDetailModalProps) {
  const { statuses, history, compromissos } = useLeadsData();
  const isAdmin = useIsAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingAcao, setIsCreatingAcao] = useState(false);

  const [andamentoText, setAndamentoText] = useState("");
  const [isSavingAndamento, setIsSavingAndamento] = useState(false);
  const [andamentoError, setAndamentoError] = useState<string | null>(null);

  const [obsText, setObsText] = useState("");
  const [isSavingObs, setIsSavingObs] = useState(false);
  const [obsError, setObsError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const statusLabel = statuses.find((s) => s.id === proposta.status_id)?.label ?? "—";
  const segmentoLabel = proposta.segmento ? SEGMENTO_LABEL[proposta.segmento] : "—";
  const andamentos = history.filter((h) => h.proposta_id === proposta.id && h.tipo === "andamento");
  const observacoes = history.filter((h) => h.proposta_id === proposta.id && h.tipo === "observacao");
  const acoes = compromissos
    .filter((c) => c.proposta_id === proposta.id)
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  function handleClose() {
    setIsEditing(false);
    setIsCreatingAcao(false);
    setAndamentoText("");
    setObsText("");
    setAndamentoError(null);
    setObsError(null);
    setConfirmingDelete(false);
    setDeleteError(null);
    onClose();
  }

  async function handleAddAndamento() {
    if (!andamentoText.trim()) return;
    setIsSavingAndamento(true);
    setAndamentoError(null);
    const result = await addProposalHistoryEntry(proposta.id, andamentoText, "andamento");
    setIsSavingAndamento(false);
    if (result.error) {
      setAndamentoError(result.error);
      return;
    }
    setAndamentoText("");
  }

  async function handleAddObservacao() {
    if (!obsText.trim()) return;
    setIsSavingObs(true);
    setObsError(null);
    const result = await addProposalHistoryEntry(proposta.id, obsText, "observacao");
    setIsSavingObs(false);
    if (result.error) {
      setObsError(result.error);
      return;
    }
    setObsText("");
  }

  async function handleCreateAcao(input: AcaoInput) {
    const result = await createAcao(proposta.id, proposta.cliente_id, input);
    return result;
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
    const initialValues: LeadInput = {
      cliente_id: proposta.cliente_id,
      termometro: proposta.termometro,
      descricao: proposta.descricao ?? "",
      segmento: proposta.segmento,
      valor_estimado: proposta.valor,
      status_id: proposta.status_id,
    };

    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={`Editar lead ${proposta.numero_lead ?? ""}`} className="max-w-2xl">
        <LeadForm
          initialValues={initialValues}
          submitLabel="Salvar alterações"
          onSubmit={(input) => updateLead(proposta.id, input)}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={proposta.numero_lead ?? undefined} className="max-w-2xl">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{proposta.cliente_nome}</p>
            {proposta.cliente_setor && (
              <p className="text-sm text-brand-graphite-light">{proposta.cliente_setor}</p>
            )}
          </div>
          <Badge variant={proposta.termometro}>{TERMOMETRO_LABEL[proposta.termometro]}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-brand-graphite-light">Segmento proposta</dt>
            <dd className="text-foreground">{segmentoLabel}</dd>
          </div>
          <div>
            <dt className="text-brand-graphite-light">Valor estimado</dt>
            <dd className="font-mono font-semibold text-foreground">
              {proposta.valor != null ? currencyFormatter.format(proposta.valor) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-brand-graphite-light">Status</dt>
            <dd className="text-foreground">{statusLabel}</dd>
          </div>
        </dl>

        {proposta.descricao && (
          <div>
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Descrição do lead
            </p>
            <p className="mt-1 text-sm text-foreground">{proposta.descricao}</p>
          </div>
        )}

        <HistoricoSection
          title="Andamento"
          entries={andamentos}
          text={andamentoText}
          onTextChange={setAndamentoText}
          onSubmit={handleAddAndamento}
          isSaving={isSavingAndamento}
          error={andamentoError}
        />

        <HistoricoSection
          title="Observações"
          entries={observacoes}
          text={obsText}
          onTextChange={setObsText}
          onSubmit={handleAddObservacao}
          isSaving={isSavingObs}
          error={obsError}
        />

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">Ações</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingAcao(true)}>
              + Ações
            </Button>
          </div>

          <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
            {acoes.length === 0 && (
              <p className="text-sm text-brand-graphite-light">Nenhuma ação registrada ainda.</p>
            )}
            {acoes.map((acao) => (
              <div key={acao.id} className="rounded-lg bg-black/[.02] p-2.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {acao.tipo && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${TIPO_COLOR[acao.tipo]} 12%, transparent)`,
                          color: TIPO_COLOR[acao.tipo],
                        }}
                      >
                        {TIPO_LABEL[acao.tipo]}
                      </span>
                    )}
                    <span className="font-medium text-foreground">{acao.titulo}</span>
                  </div>
                  <span className="text-xs text-brand-graphite-light">
                    {dateTimeFormatter.format(new Date(acao.inicio))}
                  </span>
                </div>
                {acao.descricao && <p className="mt-1 text-foreground">{acao.descricao}</p>}
              </div>
            ))}
          </div>
        </div>

        {isAdmin && deleteError && <p className="text-sm text-temp-quente">{deleteError}</p>}

        <div className="flex items-center justify-between border-t border-border pt-4">
          {isAdmin ? (
            confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-graphite-light">Excluir este lead?</span>
                <Button type="button" variant="danger" size="sm" disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting ? "Excluindo…" : "Confirmar"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
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

      <Modal
        isOpen={isCreatingAcao}
        onClose={() => setIsCreatingAcao(false)}
        title="Nova ação"
        className="max-w-2xl"
      >
        <AcaoForm
          clienteNome={proposta.cliente_nome}
          initialValues={{
            titulo: "",
            inicio: toDatetimeLocalValue(new Date()),
            fim: "",
            tipo: "reuniao",
            descricao: "",
          }}
          onSubmit={handleCreateAcao}
          onSuccess={() => setIsCreatingAcao(false)}
          onCancel={() => setIsCreatingAcao(false)}
        />
      </Modal>
    </Modal>
  );
}

interface HistoricoEntry {
  id: number;
  texto: string;
  autor_nome: string | null;
  created_at: string;
}

function HistoricoSection({
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
