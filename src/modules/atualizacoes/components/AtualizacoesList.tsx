"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { createAtualizacaoItem } from "../actions";
import type { Atualizacao, AtualizacaoItemInput, AtualizacaoItemTipo } from "../types";

const TIPO_OPTIONS: { value: AtualizacaoItemTipo; label: string }[] = [
  { value: "solicitacao", label: "Solicitação" },
  { value: "correcao", label: "Correção" },
  { value: "melhoria", label: "Melhoria" },
  { value: "inclusao", label: "Inclusão" },
];

const TIPO_LABEL: Record<AtualizacaoItemTipo, string> = {
  solicitacao: "Solicitação",
  correcao: "Correção",
  melhoria: "Melhoria",
  inclusao: "Inclusão",
};

const TIPO_BADGE_VARIANT: Record<AtualizacaoItemTipo, "info" | "success" | "warning" | "default"> = {
  solicitacao: "info",
  correcao: "warning",
  melhoria: "success",
  inclusao: "default",
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const EMPTY_ITEM_VALUES: AtualizacaoItemInput = {
  numeroChamado: "",
  tipo: "solicitacao",
  local: "",
  descricao: "",
};

export interface AtualizacoesListProps {
  atualizacoes: Atualizacao[];
}

export function AtualizacoesList({ atualizacoes }: AtualizacoesListProps) {
  const [addingItemTo, setAddingItemTo] = useState<number | null>(null);
  const [itemValues, setItemValues] = useState<AtualizacaoItemInput>(EMPTY_ITEM_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    </div>
  );
}
