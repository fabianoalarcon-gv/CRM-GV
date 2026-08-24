"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useIsAdmin } from "@/lib/auth/context";
import { SEGMENTO_LABEL, SEGMENTO_OPTIONS, type Segmento } from "@/modules/pipeline/types";
import { deleteEmpresa, updateEmpresa } from "../actions";
import { EmpresaForm } from "./EmpresaForm";
import type { EmpresaListItem } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

// Alterna entre a cor do título "Gestão de Empresas" (foreground) e a do
// subtítulo "Empresas" (brand-accent), na ordem da lista — em vez de uma
// cor por hash do nome/setor, que ficava visualmente poluído.
const AVATAR_COLORS = ["var(--color-foreground)", "var(--color-brand-accent)"];

function avatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

const PAGE_SIZE_OPTIONS = [
  { value: "20", label: "20 registros" },
  { value: "40", label: "40 registros" },
  { value: "80", label: "80 registros" },
];

export interface EmpresasTableProps {
  empresas: EmpresaListItem[];
}

export function EmpresasTable({ empresas }: EmpresasTableProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [search, setSearch] = useState("");
  const [setor, setSetor] = useState("");
  const [segmento, setSegmento] = useState<Segmento[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
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
      const matchesSegmento =
        segmento.length === 0 || c.segmento_recente.some((s) => segmento.includes(s));
      return matchesSearch && matchesSetor && matchesSegmento;
    });
  }, [empresas, search, setor, segmento]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  // Trocar busca/setor/segmento/pageSize muda o conjunto (ou o tamanho) da
  // página, então volta pra página 1 direto no handler — evitar de ficar "no
  // vazio" (ex: estava na página 3 e o novo filtro só tem 1 página).
  function updateSearch(v: string) {
    setSearch(v);
    setPage(1);
  }
  function updateSetor(v: string) {
    setSetor(v);
    setPage(1);
  }
  function updateSegmento(v: Segmento[]) {
    setSegmento(v);
    setPage(1);
  }
  function updatePageSize(v: number) {
    setPageSize(v);
    setPage(1);
  }

  const hasActiveFilters = Boolean(search || setor) || segmento.length > 0;
  function limparFiltros() {
    setSearch("");
    setSetor("");
    setSegmento([]);
    setPage(1);
  }

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
            onChange={(e) => updateSearch(e.target.value)}
            icon={<Icon name="search" size={18} />}
            className="lg:flex-1"
          />
          <Select
            value={setor}
            onChange={(e) => updateSetor(e.target.value)}
            options={setores.map((s) => ({ value: s, label: s }))}
            placeholder="Todos os setores"
            placeholderSelectable
            className="lg:w-56"
          />
          <MultiSelect
            value={segmento}
            onChange={(v) => updateSegmento(v as Segmento[])}
            options={SEGMENTO_OPTIONS}
            placeholder="Todos os segmentos"
            className="lg:w-56"
          />
          <Select
            value={String(pageSize)}
            onChange={(e) => updatePageSize(Number(e.target.value))}
            options={PAGE_SIZE_OPTIONS}
            className="lg:w-40"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={limparFiltros}
              title="Limpar filtros"
              aria-label="Limpar filtros"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-brand-graphite-light hover:text-brand-accent"
            >
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">
                <span className="font-semibold text-foreground">Empresa</span>
              </TableHead>
              <TableHead>
                <span className="font-semibold text-foreground">Segmento</span>
              </TableHead>
              <TableHead>
                <span className="font-semibold text-foreground">Setor</span>
              </TableHead>
              <TableHead className="w-1/4">
                <span className="font-semibold text-foreground">Endereço</span>
              </TableHead>
              <TableHead>
                <span className="font-semibold text-foreground">Última proposta</span>
              </TableHead>
              <TableHead>
                <span className="font-semibold text-foreground">Cadastro</span>
              </TableHead>
              <TableHead className="text-right">
                <span className="font-semibold text-foreground">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-brand-graphite-light">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            )}
            {paginated.map((empresa, index) => (
              <TableRow key={empresa.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                      style={{ backgroundColor: avatarColor(index) }}
                    >
                      {initials(empresa.nome)}
                    </div>
                    <p className="font-medium text-foreground">{empresa.nome}</p>
                  </div>
                </TableCell>
                <TableCell className="text-brand-graphite-light">
                  {empresa.segmento_recente.length > 0
                    ? empresa.segmento_recente.map((s) => SEGMENTO_LABEL[s]).join(", ")
                    : "—"}
                </TableCell>
                <TableCell className="text-brand-graphite-light">{empresa.setor ?? "—"}</TableCell>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-brand-graphite-light">
            Mostrando {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
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
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Editar ${editing.nome}` : ""}
        className="max-w-2xl"
      >
        {editing && (
          <EmpresaForm
            initialValues={{
              nome: editing.nome,
              cnpj: editing.cnpj ?? "",
              setor: editing.setor ?? "",
              endereco: editing.endereco ?? "",
              numero: editing.numero ?? "",
              cidade: editing.cidade ?? "",
              uf: editing.uf ?? "",
              cep: editing.cep ?? "",
              origem_lead: editing.origem_lead ?? "",
              site: editing.site ?? "",
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
