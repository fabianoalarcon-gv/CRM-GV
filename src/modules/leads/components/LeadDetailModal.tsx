"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useIsAdmin } from "@/lib/auth/context";
import { deleteProposal, addProposalHistoryEntry } from "@/modules/pipeline/actions";
import { HistoricoSection } from "@/modules/pipeline/components/HistoricoSection";
import type { Proposta } from "@/modules/pipeline/types";
import { TIPO_COLOR, TIPO_LABEL, toDatetimeLocalValue } from "@/modules/calendario/utils";
import { useLeadsData } from "../context";
import { arquivarLead, createAcao, gerarProposta, reativarLead, updateLead } from "../actions";
import type { AcaoInput, LeadInput } from "../types";
import { LeadForm } from "./LeadForm";
import { AcaoForm } from "./AcaoForm";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export interface LeadDetailModalProps {
  proposta: Proposta;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailModal({ proposta, isOpen, onClose }: LeadDetailModalProps) {
  const { statuses, history, compromissos } = useLeadsData();
  const isAdmin = useIsAdmin();

  const [isCreatingAcao, setIsCreatingAcao] = useState(false);

  const [isGerandoProposta, setIsGerandoProposta] = useState(false);
  const [gerarError, setGerarError] = useState<string | null>(null);
  const [confirmingGerarProposta, setConfirmingGerarProposta] = useState(false);

  const [andamentoText, setAndamentoText] = useState("");
  const [isSavingAndamento, setIsSavingAndamento] = useState(false);
  const [andamentoError, setAndamentoError] = useState<string | null>(null);

  const [obsText, setObsText] = useState("");
  const [isSavingObs, setIsSavingObs] = useState(false);
  const [obsError, setObsError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  const currentStatus = statuses.find((s) => s.id === proposta.status_id);
  const isQualificacao = currentStatus?.key === "qualificacao";
  const isArquivado = currentStatus?.key === "arquivado";
  const canArchive = currentStatus?.key === "prospeccao" || isQualificacao;
  const statusAnteriorLabel = statuses.find((s) => s.id === proposta.status_anterior_id)?.label;
  const andamentos = history.filter((h) => h.proposta_id === proposta.id && h.tipo === "andamento");
  const observacoes = history.filter((h) => h.proposta_id === proposta.id && h.tipo === "observacao");
  const acoes = compromissos
    .filter((c) => c.proposta_id === proposta.id)
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  function handleClose() {
    setIsCreatingAcao(false);
    setAndamentoText("");
    setObsText("");
    setAndamentoError(null);
    setObsError(null);
    setConfirmingDelete(false);
    setDeleteError(null);
    setConfirmingGerarProposta(false);
    setGerarError(null);
    setConfirmingArchive(false);
    setArchiveError(null);
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
    const result = await createAcao(proposta.id, proposta.empresa_id, input);
    return result;
  }

  async function handleGerarProposta() {
    setIsGerandoProposta(true);
    setGerarError(null);
    const result = await gerarProposta(proposta.id);
    setIsGerandoProposta(false);
    if (result.error) {
      setGerarError(result.error);
      return;
    }
    handleClose();
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

  async function handleArchive() {
    setIsArchiving(true);
    setArchiveError(null);
    const result = await arquivarLead(proposta.id, proposta.status_id);
    setIsArchiving(false);
    if (result.error) {
      setArchiveError(result.error);
      return;
    }
    handleClose();
  }

  async function handleReactivate() {
    setIsArchiving(true);
    setArchiveError(null);
    const result = await reativarLead(proposta.id, proposta.status_anterior_id);
    setIsArchiving(false);
    if (result.error) {
      setArchiveError(result.error);
      return;
    }
    handleClose();
  }

  const modalTitle = `Criado em ${dateFormatter.format(new Date(proposta.created_at))}`;

  const initialValues: LeadInput = {
    empresa_id: proposta.empresa_id,
    data_inicio_lead: proposta.data_inicio_lead,
    termometro: proposta.termometro,
    descricao: proposta.descricao ?? "",
    segmento: proposta.segmento,
    valor_estimado: proposta.valor,
    status_id: proposta.status_id,
    responsavel_id: proposta.responsavel_id,
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} className="max-w-2xl">
      <div className="flex flex-col gap-5">
        <LeadForm
          numeroLead={proposta.numero_lead}
          initialValues={initialValues}
          submitLabel="Salvar alterações"
          onSubmit={(input) => updateLead(proposta.id, input)}
          onSuccess={() => {}}
          onCancel={handleClose}
        />

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

        {(isAdmin || isQualificacao) && (
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <>
                  {deleteError && <p className="mb-2 text-sm text-temp-quente">{deleteError}</p>}
                  {confirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-brand-graphite-light">Excluir este lead?</span>
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
                    <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
                      Excluir
                    </Button>
                  )}
                </>
              )}

              {isAdmin && (canArchive || isArquivado) && (
                <>
                  {archiveError && <p className="mb-2 text-sm text-temp-quente">{archiveError}</p>}
                  {confirmingArchive ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-brand-graphite-light">
                        {isArquivado
                          ? `Reativar este lead${statusAnteriorLabel ? ` (volta pra ${statusAnteriorLabel})` : ""}?`
                          : "Arquivar este lead?"}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isArchiving}
                        onClick={isArquivado ? handleReactivate : handleArchive}
                      >
                        {isArchiving ? "Salvando…" : "Confirmar"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmingArchive(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingArchive(true)}
                    >
                      {isArquivado ? "Reativar" : "Arquivar"}
                    </Button>
                  )}
                </>
              )}
            </div>

            {isQualificacao && (
              <div>
                {gerarError && <p className="mb-2 text-sm text-temp-quente">{gerarError}</p>}
                {confirmingGerarProposta ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-graphite-light">Gerar proposta a partir deste lead?</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingGerarProposta(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="button" size="sm" disabled={isGerandoProposta} onClick={handleGerarProposta}>
                      {isGerandoProposta ? "Gerando…" : "Confirmar"}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={() => setConfirmingGerarProposta(true)}>
                    Gerar Proposta
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreatingAcao}
        onClose={() => setIsCreatingAcao(false)}
        title="Nova ação"
        className="max-w-2xl"
      >
        <AcaoForm
          empresaNome={proposta.empresa_nome}
          initialValues={{
            titulo: "",
            inicio: toDatetimeLocalValue(new Date()),
            fim: "",
            tipo: "reuniao",
            descricao: "",
            repeticao: "nao_repete",
            quantidadeRepeticoes: 1,
          }}
          onSubmit={handleCreateAcao}
          onSuccess={() => setIsCreatingAcao(false)}
          onCancel={() => setIsCreatingAcao(false)}
        />
      </Modal>
    </Modal>
  );
}
