"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { createAtualizacaoItem, deleteAtualizacaoItem, updateAtualizacaoItem } from "../actions";
import { TIPO_BADGE_VARIANT, TIPO_LABEL, TIPO_OPTIONS } from "../constants";
import type { Atualizacao, AtualizacaoItem, AtualizacaoItemInput, AtualizacaoItemTipo } from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const EMPTY_ITEM_VALUES: AtualizacaoItemInput = {
  numeroChamado: "",
  tipo: "solicitacao",
  local: "",
  descricao: "",
};

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

  if (atualizacoes.length === 0) {
    return (
      <p className="text-sm text-brand-graphite-light">Nenhuma atualização cadastrada ainda.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {atualizacoes.map((atualizacao) => (
        <Card key={atualizacao.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Patch {atualizacao.numeroPatch}</CardTitle>
              <p className="mt-1 text-sm text-brand-graphite-light">
                {dateTimeFormatter.format(new Date(atualizacao.dataHora))}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => openAddItem(atualizacao.id)}>
              + Incluir item
            </Button>
          </CardHeader>
          <CardContent>
            {atualizacao.itens.length === 0 ? (
              <p className="text-sm text-brand-graphite-light">Nenhum item cadastrado nesta atualização.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Chamado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atualizacao.itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.numeroChamado ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={TIPO_BADGE_VARIANT[item.tipo]}>{TIPO_LABEL[item.tipo]}</Badge>
                      </TableCell>
                      <TableCell>{item.local}</TableCell>
                      <TableCell className="text-brand-graphite-light">{item.descricao}</TableCell>
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
                          <p className="mt-1 text-right text-xs text-temp-quente">{deleteError}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}

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
