"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useIsAdmin } from "@/lib/auth/context";
import { deleteEmpresa, updateEmpresa } from "../actions";
import { EmpresaForm } from "./EmpresaForm";
import type { EmpresaListItem } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const AVATAR_COLORS = [
  "var(--color-brand-navy)",
  "var(--color-brand-accent)",
  "var(--color-cal-reuniao)",
  "var(--color-cal-embarque)",
  "var(--color-status-aprovado)",
];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

export interface EmpresasTableProps {
  empresas: EmpresaListItem[];
}

export function EmpresasTable({ empresas }: EmpresasTableProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [search, setSearch] = useState("");
  const [setor, setSetor] = useState("");
  const [editing, setEditing] = useState<EmpresaListItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const setores = useMemo(() => {
    const unique = new Set(empresas.map((c) => c.setor).filter((s): s is string => !!s));
    return Array.from(unique).sort();
  }, [empresas]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return empresas.filter((c) => {
      const matchesSearch = !query || c.nome.toLowerCase().includes(query);
      const matchesSetor = !setor || c.setor === setor;
      return matchesSearch && matchesSetor;
    });
  }, [empresas, search, setor]);

  async function handleDelete(id: number) {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteEmpresa(id);
    setIsDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Icon name="search" size={18} />}
            className="lg:flex-1"
          />
          <Select
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            options={setores.map((s) => ({ value: s, label: s }))}
            placeholder="Todos os setores"
            className="lg:w-56"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Empresa</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Última proposta</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-brand-graphite-light">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                      style={{ backgroundColor: avatarColor(empresa.setor ?? empresa.nome) }}
                    >
                      {initials(empresa.nome)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{empresa.nome}</p>
                      {empresa.setor && (
                        <p className="text-xs text-brand-graphite-light">{empresa.setor}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-brand-graphite-light">{empresa.endereco ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs text-brand-graphite-light">
                  {empresa.ultima_proposta
                    ? dateFormatter.format(new Date(`${empresa.ultima_proposta}T00:00:00`))
                    : "—"}
                </TableCell>
                <TableCell className="font-mono text-xs text-brand-graphite-light">
                  {dateFormatter.format(new Date(empresa.created_at))}
                </TableCell>
                <TableCell>
                  {deletingId === empresa.id ? (
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <span className="text-xs text-brand-graphite-light">Excluir?</span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(empresa.id)}
                        className="text-xs font-medium text-temp-quente hover:underline"
                      >
                        {isDeleting ? "Excluindo…" : "Confirmar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="text-xs font-medium text-brand-graphite-light hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Ver detalhes"
                        onClick={() => router.push(`/empresas/${empresa.id}`)}
                        className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-foreground"
                      >
                        <Icon name="visibility" size={18} />
                      </button>
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => setEditing(empresa)}
                        className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-foreground"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          title="Excluir"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingId(empresa.id);
                          }}
                          className="rounded p-1.5 text-brand-graphite-light hover:bg-temp-quente/10 hover:text-temp-quente"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      )}
                    </div>
                  )}
                  {deletingId === empresa.id && deleteError && (
                    <p className="mt-1 text-right text-xs text-temp-quente">{deleteError}</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Editar ${editing.nome}` : ""}
        className="max-w-lg"
      >
        {editing && (
          <EmpresaForm
            initialValues={{
              nome: editing.nome,
              setor: editing.setor ?? "",
              endereco: editing.endereco ?? "",
              observacoes: editing.observacoes ?? "",
            }}
            submitLabel="Salvar alterações"
            onSubmit={(input) => updateEmpresa(editing.id, input)}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
