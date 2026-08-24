"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createProposal } from "../actions";
import { ProposalForm } from "./ProposalForm";
import type { ProposalInput, ProposalStatus } from "../types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export interface NewProposalButtonProps {
  columnStatuses: ProposalStatus[];
}

export function NewProposalButton({ columnStatuses }: NewProposalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultStatusId =
    columnStatuses.find((s) => s.is_default)?.id ?? columnStatuses[0]?.id ?? 0;

  const initialValues: ProposalInput = {
    numero_proposta: "",
    data_envio: todayISO(),
    empresa_id: 0,
    servico: "",
    descricao: "",
    segmentos: [],
    valor: 0,
    status_id: defaultStatusId,
    termometro: "morno",
    tipo_servico: "spot",
    responsavel_id: null,
    resultado: null,
    motivo_reprovacao: "",
    motivo_reprovacao_detalhe: "",
  };

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        + Nova proposta
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nova proposta"
        className="max-w-2xl"
      >
        <ProposalForm
          mode="create"
          initialValues={initialValues}
          submitLabel="Criar proposta"
          onSubmit={createProposal}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
