"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import {
  createAtualizacaoItem,
  deleteAtualizacao,
  deleteAtualizacaoItem,
  setVersaoAtual,
  updateAtualizacao,
  updateAtualizacaoItem,
} from "../actions";
import { TIPO_BADGE_VARIANT, TIPO_LABEL, TIPO_OPTIONS } from "../constants";
import type {
  Atualizacao,
  AtualizacaoInput,
  AtualizacaoItem,
  AtualizacaoItemInput,
  AtualizacaoItemTipo,
} from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

// Paginação é por atualização (card inteiro), nunca por linha de item dentro
// dela — título e tabela de itens de uma mesma atualização sempre ficam
// juntos na mesma página. Uma atualização com muitos itens ganha scroll
// interno na própria tabela (ver maxHeight abaixo) em vez de estourar a
// altura da página.
const PAGE_SIZE = 5;

const EMPTY_ITEM_VALUES: AtualizacaoItemInput = {
  numeroChamado: "",
  tipo: "solicitacao",
  local: "",
  descricao: "",
};

const EMPTY_ATUALIZACAO_VALUES: AtualizacaoInput = { numeroPatch: "", dataHora: "" };

// ISO (UTC, como vem do banco) -> valor pro <input type="datetime-local">
// (YYYY-MM-DDTHH:mm no fuso local), espelhando o que NovaAtualizacaoButton
// envia de volta (new Date(valorLocal).toISOString()).
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toItemInput(item: AtualizacaoItem): AtualizacaoItemInput {
  return {
    numeroChamado: item.numeroChamado ?? "",
    tipo: item.tipo,
    local: item.local,
    descricao: item.descricao,
  };
}

export interface AtualizacoesListProps {
  atualizacoes: Atualizacao[];
}

export function AtualizacoesList({ atualizacoes }: AtualizacoesListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(atualizacoes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = atualizacoes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const [addingItemTo, setAddingItemTo] = useState<number | null>(null);
  const [itemValues, setItemValues] = useState<AtualizacaoItemInput>(EMPTY_ITEM_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<AtualizacaoItem | null>(null);
  const [editValues, setEditValues] = useState<AtualizacaoItemInput>(EMPTY_ITEM_VALUES);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editingAtualizacao, setEditingAtualizacao] = useState<Atualizacao | null>(null);
  const [atualizacaoValues, setAtualizacaoValues] = useState<AtualizacaoInput>(
    EMPTY_ATUALIZACAO_VALUES,
  );
  const [atualizacaoError, setAtualizacaoError] = useState<string | null>(null);
  const [isSavingAtualizacao, setIsSavingAtualizacao] = useState(false);

  const [deletingAtualizacaoId, setDeletingAtualizacaoId] = useState<number | null>(null);
  const [isDeletingAtualizacao, setIsDeletingAtualizacao] = useState(false);
  const [deleteAtualizacaoError, setDeleteAtualizacaoError] = useState<string | null>(null);

  const [togglingVersaoId, setTogglingVersaoId] = useState<number | null>(null);
  const [versaoError, setVersaoError] = useState<string | null>(null);
  // undefined = confia no valor vindo do servidor; number = otimisticamente
  // só esse id está marcado; null = otimisticamente nenhum está marcado.
  // Sem isso, o checkbox (controlado 100% pelo dado do servidor) voltaria
  // pra "desmarcado" assim que o React re-renderiza logo após o clique,
  // antes da Server Action responder e revalidar a página.
  const [optimisticVersaoId, setOptimisticVersaoId] = useState<number | null | undefined>(
    undefined,
  );
  const serverVersaoAtualId = atualizacoes.find((a) => a.versaoAtual)?.id ?? null;

  // Ajusta o otimismo durante o render (padrão recomendado pelo React pra
  // "reagir" a uma prop nova, em vez de useEffect) assim que o prop
  // `atualizacoes` (revalidado pela Server Action) já reflete de verdade o
  // novo estado — sem isso, resetar o otimismo assim que o "await" da action
  // resolve, sem esperar o Next.js re-buscar os dados, causava um "flash" de
  // volta pro valor antigo por uma fração de segundo.
  const [confirmedVersaoId, setConfirmedVersaoId] = useState(serverVersaoAtualId);
  if (serverVersaoAtualId !== confirmedVersaoId) {
    setConfirmedVersaoId(serverVersaoAtualId);
    if (optimisticVersaoId === serverVersaoAtualId) setOptimisticVersaoId(undefined);
  }

  const effectiveVersaoAtualId =
    optimisticVersaoId !== undefined ? optimisticVersaoId : serverVersaoAtualId;

  // Decide "marcar ou desmarcar" a partir do que a UI mostra AGORA
  // (effectiveVersaoAtualId, já com o otimismo de cliques anteriores), nunca
  // a partir de `atualizacao.versaoAtual` (que vem do prop e pode estar
  // desatualizado se o usuário clicar em duas atualizações em sequência
  // rápida, antes do Next.js revalidar a página do primeiro clique).
  async function handleToggleVersaoAtual(atualizacaoId: number) {
    setVersaoError(null);
    const marcar = effectiveVersaoAtualId !== atualizacaoId;
    setOptimisticVersaoId(marcar ? atualizacaoId : null);
    setTogglingVersaoId(atualizacaoId);
    const result = await setVersaoAtual(atualizacaoId, marcar);
    setTogglingVersaoId(null);
    if (result.error) {
      // Deu erro: não há revalidação vindo por aí pra confirmar o otimismo,
      // então reverte na hora.
      setOptimisticVersaoId(undefined);
      setVersaoError(result.error);
    }
  }

  function openAddItem(atualizacaoId: number) {
    setAddingItemTo(atualizacaoId);
    setItemValues(EMPTY_ITEM_VALUES);
    setError(null);
  }

  function closeAddItem() {
    setAddingItemTo(null);
    setItemValues(EMPTY_ITEM_VALUES);
    setError(null);
  }

  async function handleSubmitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (addingItemTo === null) return;

    setError(null);
    setIsSubmitting(true);
    const result = await createAtualizacaoItem(addingItemTo, itemValues);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    closeAddItem();
  }

  function openEditItem(item: AtualizacaoItem) {
    setEditingItem(item);
    setEditValues(toItemInput(item));
    setEditError(null);
  }

  function closeEditItem() {
    setEditingItem(null);
    setEditValues(EMPTY_ITEM_VALUES);
    setEditError(null);
  }

  async function handleSubmitEditItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItem) return;

    setEditError(null);
    setIsSaving(true);
    const result = await updateAtualizacaoItem(editingItem.id, editValues);
    setIsSaving(false);

    if (result.error) {
      setEditError(result.error);
      return;
    }
    closeEditItem();
  }

  async function handleDeleteItem(itemId: number) {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteAtualizacaoItem(itemId);
    setIsDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setDeletingItemId(null);
  }

  function openEditAtualizacao(atualizacao: Atualizacao) {
    setEditingAtualizacao(atualizacao);
    setAtualizacaoValues({
      numeroPatch: atualizacao.numeroPatch,
      dataHora: toDatetimeLocal(atualizacao.dataHora),
    });
    setAtualizacaoError(null);
  }

  function closeEditAtualizacao() {
    setEditingAtualizacao(null);
    setAtualizacaoValues(EMPTY_ATUALIZACAO_VALUES);
    setAtualizacaoError(null);
  }

  async function handleSubmitEditAtualizacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAtualizacao) return;

    setAtualizacaoError(null);
    setIsSavingAtualizacao(true);
    const result = await updateAtualizacao(editingAtualizacao.id, atualizacaoValues);
    setIsSavingAtualizacao(false);

    if (result.error) {
      setAtualizacaoError(result.error);
      return;
    }
    closeEditAtualizacao();
  }

  async function handleDeleteAtualizacao(atualizacaoId: number) {
    setIsDeletingAtualizacao(true);
    setDeleteAtualizacaoError(null);
    const result = await deleteAtualizacao(atualizacaoId);
    setIsDeletingAtualizacao(false);

    if (result.error) {
      setDeleteAtualizacaoError(result.error);
      return;
    }
    setDeletingAtualizacaoId(null);
  }

  if (atualizacoes.length === 0) {
    return (
      <p className="text-sm text-brand-graphite-light">Nenhuma atualização cadastrada ainda.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {versaoError && <p className="text-sm text-temp-quente">{versaoError}</p>}

      {paginated.map((atualizacao) => (
        <Card key={atualizacao.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Patch {atualizacao.numeroPatch}</CardTitle>
                {effectiveVersaoAtualId === atualizacao.id && (
                  <Badge variant="success">Versão Atual</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-brand-graphite-light">
                {dateTimeFormatter.format(new Date(atualizacao.dataHora))}{" "}
                <span className="font-semibold">
                  · {atualizacao.itens.length} {atualizacao.itens.length === 1 ? "item" : "itens"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={effectiveVersaoAtualId === atualizacao.id}
                  disabled={togglingVersaoId === atualizacao.id}
                  onChange={() => handleToggleVersaoAtual(atualizacao.id)}
                  className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
                />
                Versão Atual
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openAddItem(atualizacao.id)}
              >
                + Incluir item
              </Button>
              {deletingAtualizacaoId === atualizacao.id ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-xs text-brand-graphite-light">Excluir patch e itens?</span>
                  <button
                    type="button"
                    disabled={isDeletingAtualizacao}
                    onClick={() => handleDeleteAtualizacao(atualizacao.id)}
                    className="text-xs font-medium text-temp-quente hover:underline"
                  >
                    {isDeletingAtualizacao ? "Excluindo…" : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingAtualizacaoId(null)}
                    className="text-xs font-medium text-brand-graphite-light hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Editar atualização"
                    onClick={() => openEditAtualizacao(atualizacao)}
                    className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-foreground"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    type="button"
                    title="Excluir atualização"
                    onClick={() => {
                      setDeleteAtualizacaoError(null);
                      setDeletingAtualizacaoId(atualizacao.id);
                    }}
                    className="rounded p-1.5 text-brand-graphite-light hover:bg-temp-quente/10 hover:text-temp-quente"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          {deletingAtualizacaoId === atualizacao.id && deleteAtualizacaoError && (
            <p className="px-4 pb-2 text-sm text-temp-quente">{deleteAtualizacaoError}</p>
          )}
          <CardContent>
            {atualizacao.itens.length === 0 ? (
              <p className="text-sm text-brand-graphite-light">
                Nenhum item cadastrado nesta atualização.
              </p>
            ) : (
              // Não usa o wrapper <Table> aqui: aquele componente separa o
              // scroll horizontal (overflow-x-auto) num div à parte do
              // scroll vertical — como overflow-x:auto força overflow-y a
              // virar "auto" também (regra do CSS), aquele div vira o
              // "ancestral com scroll" que o sticky do cabeçalho gruda nele
              // em vez do container de altura máxima abaixo, e a "trava" no
              // topo nunca acontece. Um único div com os dois eixos de
              // scroll resolve. border-separate é necessário porque
              // border-collapse (padrão do preflight) quebra sticky em <th>
              // no Chrome/Firefox.
              <div className="max-h-96 overflow-auto rounded-lg border border-border">
                <table className="w-full border-separate border-spacing-0 text-left text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 z-10 bg-surface">Nº Chamado</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-surface">Tipo</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-surface">Local</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-surface">Descrição</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-surface text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atualizacao.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.numeroChamado ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={TIPO_BADGE_VARIANT[item.tipo]}>
                            {TIPO_LABEL[item.tipo]}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.local}</TableCell>
                        <TableCell className="text-brand-graphite-light">
                          {item.descricao}
                        </TableCell>
                        <TableCell>
                          {deletingItemId === item.id ? (
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <span className="text-xs text-brand-graphite-light">Excluir?</span>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-xs font-medium text-temp-quente hover:underline"
                              >
                                {isDeleting ? "Excluindo…" : "Confirmar"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingItemId(null)}
                                className="text-xs font-medium text-brand-graphite-light hover:underline"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Editar"
                                onClick={() => openEditItem(item)}
                                className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-foreground"
                              >
                                <Icon name="edit" size={18} />
                              </button>
                              <button
                                type="button"
                                title="Excluir"
                                onClick={() => {
                                  setDeleteError(null);
                                  setDeletingItemId(item.id);
                                }}
                                className="rounded p-1.5 text-brand-graphite-light hover:bg-temp-quente/10 hover:text-temp-quente"
                              >
                                <Icon name="delete" size={18} />
                              </button>
                            </div>
                          )}
                          {deletingItemId === item.id && deleteError && (
                            <p className="mt-1 text-right text-xs text-temp-quente">
                              {deleteError}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-brand-graphite-light">
            Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, atualizacoes.length)} de {atualizacoes.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-brand-graphite-light hover:bg-black/[.03] disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon name="chevron_left" />
            </button>
            <span className="text-sm text-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-brand-graphite-light hover:bg-black/[.03] disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={addingItemTo !== null}
        onClose={closeAddItem}
        title="Incluir item na atualização"
        className="max-w-md"
      >
        <form onSubmit={handleSubmitItem} className="flex flex-col gap-4">
          <Input
            label="Nº Chamado"
            value={itemValues.numeroChamado}
            onChange={(e) => setItemValues((prev) => ({ ...prev, numeroChamado: e.target.value }))}
          />
          <Select
            label="Tipo"
            value={itemValues.tipo}
            onChange={(e) =>
              setItemValues((prev) => ({ ...prev, tipo: e.target.value as AtualizacaoItemTipo }))
            }
            options={TIPO_OPTIONS}
          />
          <Input
            label="Local"
            required
            value={itemValues.local}
            onChange={(e) => setItemValues((prev) => ({ ...prev, local: e.target.value }))}
          />
          <Input
            label="Descrição"
            required
            value={itemValues.descricao}
            onChange={(e) => setItemValues((prev) => ({ ...prev, descricao: e.target.value }))}
          />
          {error && <p className="text-sm text-temp-quente">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeAddItem}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Incluindo…" : "Incluir"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editingAtualizacao !== null}
        onClose={closeEditAtualizacao}
        title="Editar atualização"
        className="max-w-md"
      >
        <form onSubmit={handleSubmitEditAtualizacao} className="flex flex-col gap-4">
          <Input
            label="Número do Patch"
            required
            value={atualizacaoValues.numeroPatch}
            onChange={(e) =>
              setAtualizacaoValues((prev) => ({ ...prev, numeroPatch: e.target.value }))
            }
          />
          <Input
            label="Data/Hora da Atualização"
            type="datetime-local"
            required
            value={atualizacaoValues.dataHora}
            onChange={(e) =>
              setAtualizacaoValues((prev) => ({ ...prev, dataHora: e.target.value }))
            }
          />
          {atualizacaoError && <p className="text-sm text-temp-quente">{atualizacaoError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeEditAtualizacao}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSavingAtualizacao}>
              {isSavingAtualizacao ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editingItem !== null}
        onClose={closeEditItem}
        title="Editar item"
        className="max-w-md"
      >
        <form onSubmit={handleSubmitEditItem} className="flex flex-col gap-4">
          <Input
            label="Nº Chamado"
            value={editValues.numeroChamado}
            onChange={(e) => setEditValues((prev) => ({ ...prev, numeroChamado: e.target.value }))}
          />
          <Select
            label="Tipo"
            value={editValues.tipo}
            onChange={(e) =>
              setEditValues((prev) => ({ ...prev, tipo: e.target.value as AtualizacaoItemTipo }))
            }
            options={TIPO_OPTIONS}
          />
          <Input
            label="Local"
            required
            value={editValues.local}
            onChange={(e) => setEditValues((prev) => ({ ...prev, local: e.target.value }))}
          />
          <Input
            label="Descrição"
            required
            value={editValues.descricao}
            onChange={(e) => setEditValues((prev) => ({ ...prev, descricao: e.target.value }))}
          />
          {editError && <p className="text-sm text-temp-quente">{editError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeEditItem}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
