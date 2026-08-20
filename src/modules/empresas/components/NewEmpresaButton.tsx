"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { createCaptacao } from "@/modules/captacao/actions";
import { createEmpresa } from "../actions";
import { EmpresaForm } from "./EmpresaForm";
import type { EmpresaInput } from "../types";

const EMPTY_VALUES: EmpresaInput = {
  nome: "",
  cnpj: "",
  setor: "",
  endereco: "",
  numero: "",
  cidade: "",
  uf: "",
  cep: "",
  origem_lead: "",
  site: "",
  observacoes: "",
};

export function NewEmpresaButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [createdEmpresaId, setCreatedEmpresaId] = useState<number | null>(null);
  const [isGeneratingCaptacao, setIsGeneratingCaptacao] = useState(false);

  // Guarda o id da empresa recém-criada (createEmpresa devolve mais que
  // {error}, mas EmpresaForm — compartilhado com a edição — só espera essa
  // forma) pra poder oferecer "Gerar captação" logo depois, sem tocar em
  // EmpresaForm.tsx.
  async function handleCreate(input: EmpresaInput) {
    const result = await createEmpresa(input);
    if (!result.error) setCreatedEmpresaId(result.id ?? null);
    return { error: result.error };
  }

  function handleCreateSuccess() {
    setIsOpen(false);
  }

  function closeCaptacaoPrompt() {
    setCreatedEmpresaId(null);
  }

  async function handleGerarCaptacao() {
    if (!createdEmpresaId) return;
    setIsGeneratingCaptacao(true);
    await createCaptacao(createdEmpresaId);
    setIsGeneratingCaptacao(false);
    closeCaptacaoPrompt();
  }

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} className="gap-1.5">
        <Icon name="add_business" size={18} />
        Nova Empresa
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova empresa" className="max-w-2xl">
        <EmpresaForm
          initialValues={EMPTY_VALUES}
          submitLabel="Criar empresa"
          onSubmit={handleCreate}
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={createdEmpresaId !== null}
        onClose={closeCaptacaoPrompt}
        title="Empresa cadastrada"
        className="max-w-sm"
      >
        <p className="text-sm text-brand-graphite-light">
          Deseja gerar uma captação para essa empresa agora?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={closeCaptacaoPrompt}>
            Somente cadastrar
          </Button>
          <Button type="button" onClick={handleGerarCaptacao} disabled={isGeneratingCaptacao}>
            {isGeneratingCaptacao ? "Gerando…" : "Gerar captação"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
