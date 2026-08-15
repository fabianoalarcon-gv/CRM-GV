"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useCurrentUser } from "@/lib/auth/context";
import type { Role } from "@/lib/auth/types";
import { deleteUsuario, updateUsuario } from "../actions";
import type { Usuario, UpdateUsuarioInput } from "../types";

const ROLE_OPTIONS = [
  { value: "comercial", label: "Comercial" },
  { value: "admin", label: "Admin" },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  comercial: "Comercial",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function toEditValues(usuario: Usuario): UpdateUsuarioInput {
  return { full_name: usuario.full_name, role: usuario.role, is_active: usuario.is_active };
}

export interface UsuariosTableProps {
  usuarios: Usuario[];
}

export function UsuariosTable({ usuarios }: UsuariosTableProps) {
  const currentUser = useCurrentUser();

  const [viewing, setViewing] = useState<Usuario | null>(null);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [editValues, setEditValues] = useState<UpdateUsuarioInput | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openEdit(usuario: Usuario) {
    setEditing(usuario);
    setEditValues(toEditValues(usuario));
    setEditError(null);
  }

  function closeEdit() {
    setEditing(null);
    setEditValues(null);
    setEditError(null);
  }

  async function handleSubmitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !editValues) return;

    setIsSaving(true);
    setEditError(null);
    const result = await updateUsuario(editing.id, editValues);
    setIsSaving(false);

    if (result.error) {
      setEditError(result.error);
      return;
    }

    closeEdit();
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteUsuario(id);
    setIsDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setDeletingId(null);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => {
            const isSelf = usuario.id === currentUser?.id;

            return (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">{usuario.full_name}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant="info">{ROLE_LABEL[usuario.role] ?? usuario.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.is_active ? "success" : "default"}>
                    {usuario.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-brand-graphite-light">
                  {dateFormatter.format(new Date(usuario.created_at))}
                </TableCell>
                <TableCell>
                  {deletingId === usuario.id ? (
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <span className="text-xs text-brand-graphite-light">Excluir?</span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(usuario.id)}
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
                        title="Visualizar"
                        onClick={() => setViewing(usuario)}
                        className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-foreground"
                      >
                        <Icon name="visibility" size={18} />
                      </button>
                      {!isSelf && (
                        <>
                          <button
                            type="button"
                            title="Editar"
                            onClick={() => openEdit(usuario)}
                            className="rounded p-1.5 text-brand-graphite-light hover:bg-black/[.04] hover:text-foreground"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            type="button"
                            title="Excluir"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingId(usuario.id);
                            }}
                            className="rounded p-1.5 text-brand-graphite-light hover:bg-temp-quente/10 hover:text-temp-quente"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {deletingId === usuario.id && deleteError && (
                    <p className="mt-1 text-right text-xs text-temp-quente">{deleteError}</p>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.full_name ?? ""}
        className="max-w-md"
      >
        {viewing && (
          <div className="flex flex-col gap-3 text-sm">
            <p>
              <span className="font-semibold text-foreground">E-mail:</span>{" "}
              <span className="text-brand-graphite-light">{viewing.email}</span>
            </p>
            <p>
              <span className="font-semibold text-foreground">Perfil:</span>{" "}
              <span className="text-brand-graphite-light">
                {ROLE_LABEL[viewing.role] ?? viewing.role}
              </span>
            </p>
            <p>
              <span className="font-semibold text-foreground">Status:</span>{" "}
              <span className="text-brand-graphite-light">
                {viewing.is_active ? "Ativo" : "Inativo"}
              </span>
            </p>
            <p>
              <span className="font-semibold text-foreground">Desde:</span>{" "}
              <span className="text-brand-graphite-light">
                {dateFormatter.format(new Date(viewing.created_at))}
              </span>
            </p>

            <div className="mt-2 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setViewing(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={editing !== null}
        onClose={closeEdit}
        title={editing ? `Editar ${editing.full_name}` : ""}
        className="max-w-md"
      >
        {editing && editValues && (
          <form onSubmit={handleSubmitEdit} className="flex flex-col gap-4">
            <Input
              label="Nome"
              required
              value={editValues.full_name}
              onChange={(e) => setEditValues((prev) => (prev ? { ...prev, full_name: e.target.value } : prev))}
            />
            <Select
              label="Perfil"
              value={editValues.role}
              onChange={(e) =>
                setEditValues((prev) => (prev ? { ...prev, role: e.target.value as Role } : prev))
              }
              options={ROLE_OPTIONS}
            />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={editValues.is_active}
                onChange={(e) =>
                  setEditValues((prev) => (prev ? { ...prev, is_active: e.target.checked } : prev))
                }
                className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
              />
              Usuário ativo
            </label>

            {editError && <p className="text-sm text-temp-quente">{editError}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeEdit}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
