"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useIsAdmin } from "@/lib/auth/context";
import { TIPO_COLOR, TIPO_LABEL } from "@/modules/calendario/utils";
import { SEGMENTO_LABEL, type Segmento } from "@/modules/pipeline/types";
import { addContato, deleteContato, deleteEmpresa, updateContato, updateEmpresa } from "../actions";
import { ORIGEM_LEAD_LABEL, TELEFONE_TIPO_LABEL, TELEFONE_TIPO_OPTIONS } from "../constants";
import { EmpresaForm } from "./EmpresaForm";
import type { AcaoResumo, Empresa, Contato, ContatoInput, PropostaResumo } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const TERMOMETRO_LABEL: Record<PropostaResumo["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

const EMPTY_CONTATO: ContatoInput = {
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
  telefone_tipo: "celular",
  principal: false,
};

function formatEndereco(empresa: Empresa): string {
  const linha1 = [empresa.endereco, empresa.numero].filter(Boolean).join(", ");
  const linha2 = [empresa.cidade, empresa.uf].filter(Boolean).join(" - ");
  return [linha1, linha2, empresa.cep].filter(Boolean).join(" · ");
}

export interface EmpresaDetailViewProps {
  empresa: Empresa;
  initialContatos: Contato[];
  propostas: PropostaResumo[];
  acoes: AcaoResumo[];
}

export function EmpresaDetailView({
  empresa,
  initialContatos,
  propostas,
  acoes,
}: EmpresaDetailViewProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [contatos, setContatos] = useState(initialContatos);
  const [contatoValues, setContatoValues] = useState<ContatoInput>(EMPTY_CONTATO);
  const [isContatoModalOpen, setIsContatoModalOpen] = useState(false);
  const [editingContatoId, setEditingContatoId] = useState<number | null>(null);
  const [isSavingContato, setIsSavingContato] = useState(false);
  const [contatoError, setContatoError] = useState<string | null>(null);

  const [deletingContatoId, setDeletingContatoId] = useState<number | null>(null);
  const [isDeletingContato, setIsDeletingContato] = useState(false);
  const [deleteContatoError, setDeleteContatoError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteEmpresa(empresa.id);
    setIsDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.push("/empresas");
  }

  function openAddContato() {
    setEditingContatoId(null);
    setContatoValues(EMPTY_CONTATO);
    setContatoError(null);
    setIsContatoModalOpen(true);
  }

  function openEditContato(contato: Contato) {
    setEditingContatoId(contato.id);
    setContatoValues({
      nome: contato.nome,
      cargo: contato.cargo ?? "",
      email: contato.email ?? "",
      telefone: contato.telefone ?? "",
      telefone_tipo: contato.telefone_tipo ?? "celular",
      principal: contato.principal,
    });
    setContatoError(null);
    setIsContatoModalOpen(true);
  }

  async function handleSubmitContato(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contatoValues.nome.trim()) return;

    setIsSavingContato(true);
    setContatoError(null);
    const result = editingContatoId
      ? await updateContato(editingContatoId, empresa.id, contatoValues)
      : await addContato(empresa.id, contatoValues);
    setIsSavingContato(false);

    if (result.error) {
      setContatoError(result.error);
      return;
    }

    if (editingContatoId) {
      setContatos((prev) =>
        prev.map((c) =>
          c.id === editingContatoId
            ? {
                ...c,
                nome: contatoValues.nome.trim(),
                cargo: contatoValues.cargo.trim() || null,
                email: contatoValues.email.trim() || null,
                telefone: contatoValues.telefone.trim() || null,
                telefone_tipo: contatoValues.telefone_tipo.trim() || null,
                principal: contatoValues.principal,
              }
            : c,
        ),
      );
    } else {
      setContatos((prev) => [
        ...prev,
        {
          id: Date.now(),
          empresa_id: empresa.id,
          nome: contatoValues.nome.trim(),
          cargo: contatoValues.cargo.trim() || null,
          email: contatoValues.email.trim() || null,
          telefone: contatoValues.telefone.trim() || null,
          telefone_tipo: contatoValues.telefone_tipo.trim() || null,
          principal: contatoValues.principal,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setContatoValues(EMPTY_CONTATO);
    setEditingContatoId(null);
    setIsContatoModalOpen(false);
  }

  async function handleDeleteContato(contatoId: number) {
    setIsDeletingContato(true);
    setDeleteContatoError(null);
    const result = await deleteContato(contatoId, empresa.id);
    setIsDeletingContato(false);

    if (result.error) {
      setDeleteContatoError(result.error);
      return;
    }

    setContatos((prev) => prev.filter((c) => c.id !== contatoId));
    setDeletingContatoId(null);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/empresas"
            className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase hover:underline"
          >
            ← Empresas
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {empresa.nome}
          </h1>
          {empresa.setor && <p className="mt-1 text-sm text-brand-graphite-light">{empresa.setor}</p>}
        </div>
        <div className="flex gap-2">
          {isAdmin &&
            (confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-graphite-light">Excluir empresa?</span>
                <Button variant="danger" size="sm" disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting ? "Excluindo…" : "Confirmar"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setConfirmingDelete(true)}>
                Excluir
              </Button>
            ))}
          <Button onClick={() => setIsEditing(true)}>Editar</Button>
        </div>
      </div>

      {deleteError && <p className="text-sm text-temp-quente">{deleteError}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <p className="mt-3 text-lg font-semibold text-foreground">Dados Cadastrais</p>

            <p>
              <span className="font-semibold text-foreground">CNPJ:</span>{" "}
              <span className="text-brand-graphite-light">{empresa.cnpj || "Não informado"}</span>
            </p>
            <p>
              <span className="font-semibold text-foreground">Origem do Lead:</span>{" "}
              <span className="text-brand-graphite-light">
                {empresa.origem_lead
                  ? (ORIGEM_LEAD_LABEL[empresa.origem_lead] ?? empresa.origem_lead)
                  : "Não informado"}
              </span>
            </p>
            <p>
              <span className="font-semibold text-foreground">Endereço:</span>{" "}
              <span className="text-brand-graphite-light">{formatEndereco(empresa) || "Não informado"}</span>
            </p>
            <p>
              <span className="font-semibold text-foreground">Site:</span>{" "}
              {empresa.site ? (
                <a
                  href={empresa.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-accent hover:underline"
                >
                  {empresa.site}
                </a>
              ) : (
                <span className="text-brand-graphite-light">Não informado</span>
              )}
            </p>
            <p>
              <span className="font-semibold text-foreground">Observações:</span>{" "}
              <span className="text-brand-graphite-light whitespace-pre-wrap">
                {empresa.observacoes || "Nenhuma observação registrada."}
              </span>
            </p>
            <p>
              <span className="font-semibold text-foreground">Cadastrado em:</span>{" "}
              <span className="text-brand-graphite-light">
                {dateFormatter.format(new Date(empresa.created_at))}
              </span>
            </p>
            <p>
              <span className="font-semibold text-foreground">E-mail:</span>{" "}
              <span className="text-brand-graphite-light">{empresa.criador_email || "Não informado"}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="mt-3 flex items-start justify-between gap-2">
              <p className="text-lg font-semibold text-foreground">Contatos</p>
              <Button type="button" size="sm" onClick={openAddContato}>
                Adicionar Contato
              </Button>
            </div>

            <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
              {contatos.length === 0 && (
                <p className="text-sm text-brand-graphite-light">Nenhum contato cadastrado.</p>
              )}
              {contatos.map((contato) => (
                <div key={contato.id} className="rounded-lg border border-border bg-black/[.02] p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p>
                      <span className="font-semibold text-foreground">Nome:</span>{" "}
                      <span className="text-brand-graphite-light">{contato.nome}</span>
                    </p>
                    {contato.principal && <Badge variant="info">Principal</Badge>}
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">Cargo:</span>{" "}
                    <span className="text-brand-graphite-light">{contato.cargo || "—"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">E-mail:</span>{" "}
                    <span className="text-brand-graphite-light">{contato.email || "—"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Telefone:</span>{" "}
                    <span className="text-brand-graphite-light">
                      {contato.telefone || "—"}
                      {contato.telefone &&
                        contato.telefone_tipo &&
                        ` (${TELEFONE_TIPO_LABEL[contato.telefone_tipo] ?? contato.telefone_tipo})`}
                    </span>
                  </p>

                  {deletingContatoId === contato.id ? (
                    <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-2">
                      <span className="text-xs text-brand-graphite-light">Excluir contato?</span>
                      <button
                        type="button"
                        disabled={isDeletingContato}
                        onClick={() => handleDeleteContato(contato.id)}
                        className="text-xs font-medium text-temp-quente hover:underline"
                      >
                        {isDeletingContato ? "Excluindo…" : "Confirmar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingContatoId(null)}
                        className="text-xs font-medium text-brand-graphite-light hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-2">
                      <button
                        type="button"
                        onClick={() => openEditContato(contato)}
                        className="text-xs font-medium text-brand-graphite-light hover:text-foreground hover:underline"
                      >
                        Editar
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteContatoError(null);
                            setDeletingContatoId(contato.id);
                          }}
                          className="text-xs font-medium text-temp-quente hover:underline"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  )}
                  {deletingContatoId === contato.id && deleteContatoError && (
                    <p className="mt-1 text-right text-xs text-temp-quente">{deleteContatoError}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <p className="mt-3 text-lg font-semibold text-foreground">Interações</p>

            <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
              {acoes.length === 0 && (
                <p className="text-sm text-brand-graphite-light">
                  Nenhuma interação registrada ainda.
                </p>
              )}
              {acoes.map((acao) => (
                <div key={acao.id} className="rounded-lg border border-border bg-black/[.02] p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5">
                      {acao.tipo && (
                        <span
                          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${TIPO_COLOR[acao.tipo]} 15%, transparent)`,
                            color: TIPO_COLOR[acao.tipo],
                          }}
                        >
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: TIPO_COLOR[acao.tipo] }}
                          />
                          {TIPO_LABEL[acao.tipo]}
                        </span>
                      )}
                      <p className="font-medium text-foreground">{acao.titulo}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-brand-graphite-light">
                      <p>Início: {dateTimeFormatter.format(new Date(acao.inicio))}</p>
                      {acao.fim && <p>Fim: {dateTimeFormatter.format(new Date(acao.fim))}</p>}
                      {acao.numero_lead_proposta && <p>Lead/Proposta: {acao.numero_lead_proposta}</p>}
                    </div>
                  </div>
                  {acao.descricao && <p className="mt-2 text-foreground">{acao.descricao}</p>}
                  {acao.criador_email && (
                    <p className="mt-1 text-xs text-brand-graphite-light">{acao.criador_email}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="mt-3 text-lg font-semibold text-foreground">Propostas Vinculadas</p>

          {propostas.length === 0 ? (
            <p className="text-sm text-brand-graphite-light">
              Nenhuma proposta registrada para esta empresa ainda.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>
                      <span className="font-semibold text-foreground">Lead/Proposta</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-foreground">Segmento</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-foreground">Status</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-foreground">Termômetro</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-foreground">Data Criação</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-foreground">Última Atualização</span>
                    </TableHead>
                    <TableHead className="text-right">
                      <span className="font-semibold text-foreground">Valor</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propostas.map((proposta) => (
                    <TableRow key={proposta.id}>
                      <TableCell className="font-mono text-xs text-brand-graphite-light">
                        {proposta.numero_proposta ?? proposta.numero_lead ?? "—"}
                      </TableCell>
                      <TableCell className="text-brand-graphite-light">
                        {proposta.segmento
                          ? (SEGMENTO_LABEL[proposta.segmento as Segmento] ?? proposta.segmento)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-brand-graphite-light">{proposta.status_label}</TableCell>
                      <TableCell>
                        <Badge variant={proposta.termometro}>
                          {TERMOMETRO_LABEL[proposta.termometro]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-brand-graphite-light">
                        {dateFormatter.format(new Date(proposta.created_at))}
                      </TableCell>
                      <TableCell className="text-brand-graphite-light">
                        {dateFormatter.format(new Date(proposta.updated_at))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-brand-graphite-light">
                        {proposta.valor != null ? currencyFormatter.format(proposta.valor) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={`Editar ${empresa.nome}`}
        className="max-w-2xl"
      >
        <EmpresaForm
          initialValues={{
            nome: empresa.nome,
            cnpj: empresa.cnpj ?? "",
            setor: empresa.setor ?? "",
            endereco: empresa.endereco ?? "",
            numero: empresa.numero ?? "",
            cidade: empresa.cidade ?? "",
            uf: empresa.uf ?? "",
            cep: empresa.cep ?? "",
            origem_lead: empresa.origem_lead ?? "",
            site: empresa.site ?? "",
            observacoes: empresa.observacoes ?? "",
          }}
          submitLabel="Salvar alterações"
          onSubmit={(input) => updateEmpresa(empresa.id, input)}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      <Modal
        isOpen={isContatoModalOpen}
        onClose={() => setIsContatoModalOpen(false)}
        title={editingContatoId ? "Editar Contato" : "Adicionar Contato"}
        className="max-w-md"
      >
        <form onSubmit={handleSubmitContato} className="flex flex-col gap-4">
          <Input
            label="Nome"
            required
            value={contatoValues.nome}
            onChange={(e) => setContatoValues((prev) => ({ ...prev, nome: e.target.value }))}
          />
          <Input
            label="Cargo"
            value={contatoValues.cargo}
            onChange={(e) => setContatoValues((prev) => ({ ...prev, cargo: e.target.value }))}
          />
          <Input
            label="E-mail"
            type="email"
            value={contatoValues.email}
            onChange={(e) => setContatoValues((prev) => ({ ...prev, email: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={contatoValues.telefone}
              onChange={(e) => setContatoValues((prev) => ({ ...prev, telefone: e.target.value }))}
            />
            <Select
              label="Tipo de Telefone"
              value={contatoValues.telefone_tipo}
              onChange={(e) =>
                setContatoValues((prev) => ({ ...prev, telefone_tipo: e.target.value }))
              }
              options={TELEFONE_TIPO_OPTIONS}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={contatoValues.principal}
              onChange={(e) =>
                setContatoValues((prev) => ({ ...prev, principal: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
            />
            Contato principal
          </label>

          {contatoError && <p className="text-sm text-temp-quente">{contatoError}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsContatoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSavingContato || !contatoValues.nome.trim()}>
              {isSavingContato
                ? "Salvando…"
                : editingContatoId
                  ? "Salvar alterações"
                  : "Adicionar contato"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
