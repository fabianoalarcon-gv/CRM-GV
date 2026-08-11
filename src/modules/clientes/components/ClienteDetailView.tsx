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
import { Textarea } from "@/components/ui/Textarea";
import { useIsAdmin } from "@/lib/auth/context";
import { addContato, addInteracao, deleteCliente, updateCliente } from "../actions";
import { ClienteForm } from "./ClienteForm";
import type { Cliente, Contato, ContatoInput, Interacao, InteracaoInput, PropostaResumo } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const TERMOMETRO_LABEL: Record<PropostaResumo["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

const EMPTY_CONTATO: ContatoInput = { nome: "", cargo: "", email: "", telefone: "" };
const EMPTY_INTERACAO: InteracaoInput = { tipo: "reuniao", descricao: "" };

const TIPO_INTERACAO_OPTIONS = [
  { value: "reuniao", label: "Reunião" },
  { value: "ligacao", label: "Ligação" },
  { value: "email", label: "E-mail" },
  { value: "follow_up", label: "Follow-up" },
  { value: "outro", label: "Outro" },
];

const TIPO_INTERACAO_LABEL: Record<string, string> = Object.fromEntries(
  TIPO_INTERACAO_OPTIONS.map((o) => [o.value, o.label]),
);

export interface ClienteDetailViewProps {
  cliente: Cliente;
  initialContatos: Contato[];
  propostas: PropostaResumo[];
  initialInteracoes: Interacao[];
}

export function ClienteDetailView({
  cliente,
  initialContatos,
  propostas,
  initialInteracoes,
}: ClienteDetailViewProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [contatos, setContatos] = useState(initialContatos);
  const [contatoValues, setContatoValues] = useState<ContatoInput>(EMPTY_CONTATO);
  const [isAddingContato, setIsAddingContato] = useState(false);
  const [contatoError, setContatoError] = useState<string | null>(null);

  const [interacoes, setInteracoes] = useState(initialInteracoes);
  const [interacaoValues, setInteracaoValues] = useState<InteracaoInput>(EMPTY_INTERACAO);
  const [isAddingInteracao, setIsAddingInteracao] = useState(false);
  const [interacaoError, setInteracaoError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteCliente(cliente.id);
    setIsDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.push("/clientes");
  }

  async function handleAddContato(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contatoValues.nome.trim()) return;

    setIsAddingContato(true);
    setContatoError(null);
    const result = await addContato(cliente.id, contatoValues);
    setIsAddingContato(false);

    if (result.error) {
      setContatoError(result.error);
      return;
    }

    setContatos((prev) => [
      ...prev,
      {
        id: Date.now(),
        cliente_id: cliente.id,
        nome: contatoValues.nome.trim(),
        cargo: contatoValues.cargo.trim() || null,
        email: contatoValues.email.trim() || null,
        telefone: contatoValues.telefone.trim() || null,
        created_at: new Date().toISOString(),
      },
    ]);
    setContatoValues(EMPTY_CONTATO);
  }

  async function handleAddInteracao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!interacaoValues.descricao.trim()) return;

    setIsAddingInteracao(true);
    setInteracaoError(null);
    const result = await addInteracao(cliente.id, interacaoValues);
    setIsAddingInteracao(false);

    if (result.error) {
      setInteracaoError(result.error);
      return;
    }

    setInteracoes((prev) => [
      {
        id: Date.now(),
        cliente_id: cliente.id,
        tipo: interacaoValues.tipo || null,
        descricao: interacaoValues.descricao.trim(),
        data_interacao: new Date().toISOString(),
        autor_nome: null,
      },
      ...prev,
    ]);
    setInteracaoValues(EMPTY_INTERACAO);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/clientes"
            className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase hover:underline"
          >
            ← Clientes
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {cliente.nome}
          </h1>
          {cliente.setor && <p className="mt-1 text-sm text-brand-graphite-light">{cliente.setor}</p>}
        </div>
        <div className="flex gap-2">
          {isAdmin &&
            (confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-graphite-light">Excluir cliente?</span>
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
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-4 p-5">
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Endereço
              </p>
              <p className="mt-1 text-sm text-foreground">{cliente.endereco || "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Observações
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">
                {cliente.observacoes || "Nenhuma observação registrada."}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
                Cadastrado em
              </p>
              <p className="mt-1 text-sm text-foreground">
                {dateFormatter.format(new Date(cliente.created_at))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Contatos
            </p>

            <div className="flex flex-col gap-3">
              {contatos.length === 0 && (
                <p className="text-sm text-brand-graphite-light">Nenhum contato cadastrado.</p>
              )}
              {contatos.map((contato) => (
                <div key={contato.id} className="rounded-lg bg-black/[.02] p-2.5 text-sm">
                  <p className="font-medium text-foreground">{contato.nome}</p>
                  {contato.cargo && <p className="text-brand-graphite-light">{contato.cargo}</p>}
                  {contato.email && <p className="text-brand-graphite-light">{contato.email}</p>}
                  {contato.telefone && (
                    <p className="text-brand-graphite-light">{contato.telefone}</p>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddContato} className="flex flex-col gap-2 border-t border-border pt-3">
              <Input
                placeholder="Nome"
                value={contatoValues.nome}
                onChange={(e) => setContatoValues((prev) => ({ ...prev, nome: e.target.value }))}
              />
              <Input
                placeholder="Cargo"
                value={contatoValues.cargo}
                onChange={(e) => setContatoValues((prev) => ({ ...prev, cargo: e.target.value }))}
              />
              <Input
                placeholder="E-mail"
                type="email"
                value={contatoValues.email}
                onChange={(e) => setContatoValues((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Telefone"
                value={contatoValues.telefone}
                onChange={(e) =>
                  setContatoValues((prev) => ({ ...prev, telefone: e.target.value }))
                }
              />
              {contatoError && <p className="text-sm text-temp-quente">{contatoError}</p>}
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={isAddingContato || !contatoValues.nome.trim()}
              >
                {isAddingContato ? "Salvando…" : "Adicionar contato"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-3 p-5">
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Propostas vinculadas
            </p>

            {propostas.length === 0 && (
              <p className="text-sm text-brand-graphite-light">
                Nenhuma proposta registrada para este cliente ainda.
              </p>
            )}
            {propostas.map((proposta) => (
              <div
                key={proposta.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/[.02] p-2.5 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-brand-graphite-light">
                    {proposta.numero_proposta ?? proposta.numero_lead ?? "—"}
                  </span>
                  <span className="text-foreground">{proposta.status_label}</span>
                  <Badge variant={proposta.termometro}>
                    {TERMOMETRO_LABEL[proposta.termometro]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-brand-graphite-light">
                  <span>{dateFormatter.format(new Date(proposta.data_envio))}</span>
                  <span className="font-mono font-semibold text-foreground">
                    {proposta.valor != null ? currencyFormatter.format(proposta.valor) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <p className="text-xs font-medium tracking-wide text-brand-graphite-light uppercase">
              Interações
            </p>

            <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
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

            <form
              onSubmit={handleAddInteracao}
              className="flex flex-col gap-2 border-t border-border pt-3"
            >
              <Select
                value={interacaoValues.tipo}
                onChange={(e) =>
                  setInteracaoValues((prev) => ({ ...prev, tipo: e.target.value }))
                }
                options={TIPO_INTERACAO_OPTIONS}
              />
              <Textarea
                placeholder="Descreva a interação..."
                rows={2}
                value={interacaoValues.descricao}
                onChange={(e) =>
                  setInteracaoValues((prev) => ({ ...prev, descricao: e.target.value }))
                }
              />
              {interacaoError && <p className="text-sm text-temp-quente">{interacaoError}</p>}
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={isAddingInteracao || !interacaoValues.descricao.trim()}
              >
                {isAddingInteracao ? "Salvando…" : "Registrar interação"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={`Editar ${cliente.nome}`}
        className="max-w-lg"
      >
        <ClienteForm
          initialValues={{
            nome: cliente.nome,
            setor: cliente.setor ?? "",
            endereco: cliente.endereco ?? "",
            observacoes: cliente.observacoes ?? "",
          }}
          submitLabel="Salvar alterações"
          onSubmit={(input) => updateCliente(cliente.id, input)}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    </div>
  );
}
