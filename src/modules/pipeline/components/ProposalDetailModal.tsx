"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useIsAdmin } from "@/lib/auth/context";
import { usePipelineData } from "../context";
import { addProposalHistoryEntry, deleteProposal, updateProposal } from "../actions";
import { HistoricoSection } from "./HistoricoSection";
import { createAcao, reverterParaQualificacao } from "@/modules/leads/actions";
import type { AcaoInput } from "@/modules/leads/types";
import { AcaoForm } from "@/modules/leads/components/AcaoForm";
import { TIPO_COLOR, TIPO_LABEL, toDatetimeLocalValue } from "@/modules/calendario/utils";
import { ProposalForm } from "./ProposalForm";
import type { Proposta } from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export interface ProposalDetailModalProps {
  proposta: Proposta;
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalDetailModal({ proposta, isOpen, onClose }: ProposalDetailModalProps) {
  const { history, statuses, compromissos } = usePipelineData();
  const isAdmin = useIsAdmin();

  const [andamentoText, setAndamentoText] = useState("");
  const [isSavingAndamento, setIsSavingAndamento] = useState(false);
  const [andamentoError, setAndamentoError] = useState<string | null>(null);

  const [obsText, setObsText] = useState("");
  const [isSavingObs, setIsSavingObs] = useState(false);
  const [obsError, setObsError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [isReverting, setIsReverting] = useState(false);
  const [revertError, setRevertError] = useState<string | null>(null);
  const [confirmingRevert, setConfirmingRevert] = useState(false);

  const [isCreatingAcao, setIsCreatingAcao] = useState(false);

  const andamentos = history.filter((h) => h.proposta_id === proposta.id && h.tipo === "andamento");
  const observacoes = history.filter((h) => h.proposta_id === proposta.id && h.tipo === "observacao");
  const acoes = compromissos
    .filter((c) => c.proposta_id === proposta.id)
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const canRevert =
    proposta.gerado_de_lead && statuses.find((s) => s.id === proposta.status_id)?.key === "proposta";

  function handleClose() {
    setConfirmingDelete(false);
    setAndamentoText("");
    setAndamentoError(null);
    setObsText("");
    setObsError(null);
    setDeleteError(null);
    setConfirmingRevert(false);
    setRevertError(null);
    setIsCreatingAcao(false);
    onClose();
  }

  async function handleCreateAcao(input: AcaoInput) {
    return createAcao(proposta.id, proposta.cliente_id, input);
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

  async function handleRevert() {
    setIsReverting(true);
    setRevertError(null);
    const result = await reverterParaQualificacao(proposta.id);
    setIsReverting(false);
    if (result.error) {
      setRevertError(result.error);
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

  const modalTitle = `Criado em ${dateFormatter.format(new Date(proposta.created_at))}`;

  const initialValues = {
    numero_proposta: proposta.numero_proposta ?? "",
    data_envio: proposta.data_envio,
    cliente_id: proposta.cliente_id,
    servico: proposta.servico ?? "",
    descricao: proposta.descricao ?? "",
    segmento: proposta.segmento,
    valor: proposta.valor ?? 0,
    status_id: proposta.status_id,
    termometro: proposta.termometro,
    tipo_servico: proposta.tipo_servico ?? "spot" as const,
    responsavel_id: proposta.responsavel_id,
    resultado: proposta.resultado,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-5">
        {proposta.gerado_de_lead && proposta.numero_lead && (
          <p className="text-xs text-brand-graphite-light">
            Gerada a partir do lead{" "}
            <span className="font-mono font-medium text-foreground">{proposta.numero_lead}</span>
          </p>
        )}

        <ProposalForm
          initialValues={initialValues}
          submitLabel="Salvar alterações"
          onSubmit={(input) => updateProposal(proposta.id, input)}
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

        {(isAdmin || canRevert) && (
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              {isAdmin && (
                <>
                  {deleteError && <p className="mb-2 text-sm text-temp-quente">{deleteError}</p>}
                  {confirmingDelete ? (
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
                  )}
                </>
              )}
            </div>

            {canRevert && (
              <div>
                {revertError && <p className="mb-2 text-sm text-temp-quente">{revertError}</p>}
                {confirmingRevert ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-graphite-light">
                      Reverter esta proposta para Qualificação?
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingRevert(false)}>
                      Cancelar
                    </Button>
                    <Button type="button" size="sm" disabled={isReverting} onClick={handleRevert}>
                      {isReverting ? "Revertendo…" : "Confirmar"}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setConfirmingRevert(true)}>
                    Reverter para Qualificação
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
          clienteNome={proposta.cliente_nome}
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
