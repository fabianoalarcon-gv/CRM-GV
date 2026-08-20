"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useLeadsData } from "../context";
import { createLead } from "../actions";
import { LeadForm } from "./LeadForm";
import type { LeadInput } from "../types";

export function NewLeadButton() {
  const { statuses } = useLeadsData();
  const [isOpen, setIsOpen] = useState(false);

  const defaultStatusId = statuses.find((s) => s.is_default)?.id ?? statuses[0]?.id ?? 0;

  const initialValues: LeadInput = {
    empresa_id: 0,
    data_inicio_lead: new Date().toISOString().slice(0, 10),
    termometro: null,
    descricao: "",
    segmento: null,
    valor_estimado: null,
    status_id: defaultStatusId,
    responsavel_id: null,
  };

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        + Novo lead
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Novo lead" className="max-w-2xl">
        <LeadForm
          initialValues={initialValues}
          submitLabel="Criar lead"
          onSubmit={createLead}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
