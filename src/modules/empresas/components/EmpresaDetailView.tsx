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
import { SEGMENTO_LABEL, type Segmento } from "@/modules/pipeline/types";
import { addContato, deleteEmpresa, updateEmpresa } from "../actions";
import { ORIGEM_LEAD_LABEL, TELEFONE_TIPO_LABEL, TELEFONE_TIPO_OPTIONS } from "../constants";
import { EmpresaForm } from "./EmpresaForm";
import type { Empresa, Contato, ContatoInput, Interacao, PropostaResumo } from "../types";

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

const TIPO_INTERACAO_LABEL: Record<string, string> = {
  reuniao: "Reunião",
  ligacao: "Ligação",
  email: "E-mail",
  follow_up: "Follow-up",
  outro: "Outro",
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
  initialInteracoes: Interacao[];
}

export function EmpresaDetailView({
  empresa,
  initialContatos,
  propostas,
  initialInteracoes,
}: EmpresaDetailViewProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [contatos, setContatos] = useState(initialContatos);
  const [contatoValues, setContatoValues] = useState<ContatoInput>(EMPTY_CONTATO);
  const [isAddContatoOpen, setIsAddContatoOpen] = useState(false);
  const [isAddingContato, setIsAddingContato] = useState(false);
  const [contatoError, setContatoError] = useState<string | null>(null);

  const [interacoes] = useState(initialInteracoes);

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

  async function handleAddContato(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contatoValues.nome.trim()) return;

    setIsAddingContato(true);
    setContatoError(null);
    const result = await addContato(empresa.id, contatoValues);
    setIsAddingContato(false);

    if (result.error) {
      setContatoError(result.error);
      return;
    }

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
    setContatoValues(EMPTY_CONTATO);
    setIsAddContatoOpen(false);
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
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Dados Cadastrais
            </p>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                CNPJ
              </p>
              <p className="mt-1 text-sm text-foreground">{empresa.cnpj || "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Origem do Lead
              </p>
              <p className="mt-1 text-sm text-foreground">
                {empresa.origem_lead ? (ORIGEM_LEAD_LABEL[empresa.origem_lead] ?? empresa.origem_lead) : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Endereço
              </p>
              <p className="mt-1 text-sm text-foreground">{formatEndereco(empresa) || "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Site
              </p>
              {empresa.site ? (
                <a
                  href={empresa.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-brand-accent hover:underline"
                >
                  {empresa.site}
                </a>
              ) : (
                <p className="mt-1 text-sm text-foreground">Não informado</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Observações
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">
                {empresa.observacoes || "Nenhuma observação registrada."}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Cadastrado em
              </p>
              <p className="mt-1 text-sm text-foreground">
                {dateFormatter.format(new Date(empresa.created_at))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Contatos
              </p>
              <Button type="button" size="sm" variant="outline" onClick={() => setIsAddContatoOpen(true)}>
                Adicionar Contato
              </Button>
            </div>

            <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
              {contatos.length === 0 && (
                <p className="text-sm text-brand-graphite-light">Nenhum contato cadastrado.</p>
              )}
              {contatos.map((contato) => (
                <div key={contato.id} className="rounded-lg bg-black/[.02] p-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{contato.nome}</p>
                    {contato.principal && <Badge variant="info">Principal</Badge>}
                  </div>
                  {contato.cargo && <p className="text-brand-graphite-light">{contato.cargo}</p>}
                  {contato.email && <p className="text-brand-graphite-light">{contato.email}</p>}
                  {contato.telefone && (
                    <p className="text-brand-graphite-light">
                      {contato.telefone}
                      {contato.telefone_tipo &&
                        ` · ${TELEFONE_TIPO_LABEL[contato.telefone_tipo] ?? contato.telefone_tipo}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Interações
            </p>

            <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
              {interacoes.length === 0 && (
                <p className="text-sm text-brand-graphite-light">
                  Nenhuma interação registrada ainda.
                </p>
              )}
              {interacoes.map((interacao) => (
                <div key={interacao.id} className="rounded-lg bg-black/[.02] p-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {interacao.tipo ? (TIPO_INTERACAO_LABEL[interacao.tipo] ?? interacao.tipo) : "—"}
                    </span>
                    <span className="text-xs text-brand-graphite-light">
                      {dateTimeFormatter.format(new Date(interacao.data_interacao))}
                    </span>
                  </div>
                  <p className="mt-1 text-foreground">{interacao.descricao}</p>
                  {interacao.autor_nome && (
                    <p className="mt-1 text-xs text-brand-graphite-light">{interacao.autor_nome}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
            Propostas vinculadas
          </p>

          {propostas.length === 0 ? (
            <p className="text-sm text-brand-graphite-light">
              Nenhuma proposta registrada para esta empresa ainda.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Número Lead/Proposta</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Termômetro</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propostas.map((proposta) => (
                    <TableRow key={proposta.id}>
                      <TableCell className="font-mono text-xs text-brand-graphite-light">
                        {proposta.numero_proposta ?? proposta.numero_lead ?? "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {proposta.segmento
                          ? (SEGMENTO_LABEL[proposta.segmento as Segmento] ?? proposta.segmento)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-foreground">{proposta.status_label}</TableCell>
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
                      <TableCell className="text-right font-mono font-semibold text-foreground">
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
        isOpen={isAddContatoOpen}
        onClose={() => setIsAddContatoOpen(false)}
        title="Adicionar Contato"
        className="max-w-md"
      >
        <form onSubmit={handleAddContato} className="flex flex-col gap-4">
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
            <Button type="button" variant="ghost" onClick={() => setIsAddContatoOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isAddingContato || !contatoValues.nome.trim()}>
              {isAddingContato ? "Salvando…" : "Adicionar contato"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
