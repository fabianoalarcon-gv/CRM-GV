"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { deleteAcao } from "@/modules/leads/actions";
import { deleteCompromisso, updateCompromisso } from "../actions";
import { TIPO_COLOR, TIPO_LABEL, isBeforeToday, toDatetimeLocalValue } from "../utils";
import { CompromissoForm } from "./CompromissoForm";
import type { ClienteOption, Compromisso } from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export interface CompromissoDetailModalProps {
  compromisso: Compromisso;
  clientes: ClienteOption[];
  isOpen: boolean;
  onClose: () => void;
}

export function CompromissoDetailModal({
  compromisso,
  clientes,
  isOpen,
  onClose,
}: CompromissoDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteScope, setDeleteScope] = useState<"somente_esta" | "esta_e_futuras">("somente_esta");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isAcao = compromisso.proposta_id != null;
  const isPastAcao = isAcao && isBeforeToday(compromisso.inicio);

  function handleClose() {
    setIsEditing(false);
    setConfirmingDelete(false);
    setDeleteScope("somente_esta");
    setDeleteError(null);
    onClose();
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = compromisso.proposta_id
      ? await deleteAcao(compromisso.id, compromisso.proposta_id, deleteScope)
      : await deleteCompromisso(compromisso.id);
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
        title={`Editar ${compromisso.titulo}`}
        className="max-w-lg"
      >
        <CompromissoForm
          clientes={clientes}
          initialValues={{
            titulo: compromisso.titulo,
            descricao: compromisso.descricao ?? "",
            inicio: toDatetimeLocalValue(new Date(compromisso.inicio)),
            fim: compromisso.fim ? toDatetimeLocalValue(new Date(compromisso.fim)) : "",
            tipo: compromisso.tipo ?? "outro",
            cliente_id: compromisso.cliente_id,
          }}
          submitLabel="Salvar alterações"
          onSubmit={(input) => updateCompromisso(compromisso.id, input)}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={compromisso.titulo} className="max-w-lg">
      <div className="flex flex-col gap-4">
        {compromisso.tipo && (
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${TIPO_COLOR[compromisso.tipo]} 15%, transparent)`,
              color: TIPO_COLOR[compromisso.tipo],
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: TIPO_COLOR[compromisso.tipo] }}
            />
            {TIPO_LABEL[compromisso.tipo]}
          </span>
        )}

        <div>
          <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
            Início
          </p>
          <p className="mt-1 text-sm text-foreground">
            {dateTimeFormatter.format(new Date(compromisso.inicio))}
          </p>
        </div>

        {compromisso.fim && (
          <div>
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Fim
            </p>
            <p className="mt-1 text-sm text-foreground">
              {dateTimeFormatter.format(new Date(compromisso.fim))}
            </p>
          </div>
        )}

        {compromisso.cliente_nome && (
          <div>
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Cliente
            </p>
            <p className="mt-1 text-sm text-foreground">{compromisso.cliente_nome}</p>
          </div>
        )}

        {compromisso.descricao && (
          <div>
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Descrição
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">
              {compromisso.descricao}
            </p>
          </div>
        )}

        {compromisso.criado_por_nome && (
          <p className="text-xs text-brand-graphite-light">
            Criado por {compromisso.criado_por_nome}
          </p>
        )}

        {deleteError && <p className="text-sm text-temp-quente">{deleteError}</p>}

        <div className="flex items-center justify-between border-t border-border pt-4">
          {confirmingDelete ? (
            <div className="flex flex-col gap-2">
              {isAcao && (
                <div className="flex flex-col gap-1.5 text-sm text-foreground">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="delete-scope"
                      checked={deleteScope === "somente_esta"}
                      onChange={() => setDeleteScope("somente_esta")}
                    />
                    Excluir somente esta ação
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="delete-scope"
                      checked={deleteScope === "esta_e_futuras"}
                      onChange={() => setDeleteScope("esta_e_futuras")}
                    />
                    Excluir esta e as futuras deste Lead/Proposta
                  </label>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-graphite-light">
                  {isAcao ? "Confirmar exclusão?" : "Excluir compromisso?"}
                </span>
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
            </div>
          ) : isPastAcao ? (
            <p className="text-sm text-brand-graphite-light">
              Ações que já passaram não podem ser excluídas.
            </p>
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
          <Button type="button" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
