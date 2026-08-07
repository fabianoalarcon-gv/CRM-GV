"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { deleteCompromisso, updateCompromisso } from "../actions";
import { toDatetimeLocalValue } from "../utils";
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
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleClose() {
    setIsEditing(false);
    setConfirmingDelete(false);
    setDeleteError(null);
    onClose();
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteCompromisso(compromisso.id);
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-graphite-light">Excluir compromisso?</span>
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
          <Button type="button" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
