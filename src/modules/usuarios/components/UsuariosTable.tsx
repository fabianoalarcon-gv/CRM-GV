"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useCurrentUser } from "@/lib/auth/context";
import type { Role } from "@/lib/auth/types";
import { updateUsuario } from "../actions";
import type { Usuario } from "../types";

const ROLE_OPTIONS = [
  { value: "comercial", label: "Comercial" },
  { value: "admin", label: "Admin" },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export interface UsuariosTableProps {
  usuarios: Usuario[];
}

export function UsuariosTable({ usuarios }: UsuariosTableProps) {
  const currentUser = useCurrentUser();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  async function handleRoleChange(usuario: Usuario, role: Role) {
    setSavingId(usuario.id);
    const result = await updateUsuario(usuario.id, {
      full_name: usuario.full_name,
      role,
      is_active: usuario.is_active,
    });
    setSavingId(null);
    setErrorById((prev) => ({ ...prev, [usuario.id]: result.error ?? "" }));
  }

  async function handleToggleActive(usuario: Usuario) {
    setSavingId(usuario.id);
    const result = await updateUsuario(usuario.id, {
      full_name: usuario.full_name,
      role: usuario.role,
      is_active: !usuario.is_active,
    });
    setSavingId(null);
    setErrorById((prev) => ({ ...prev, [usuario.id]: result.error ?? "" }));
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Desde</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => {
          const isSelf = usuario.id === currentUser?.id;
          const isSaving = savingId === usuario.id;
          const error = errorById[usuario.id];

          return (
            <TableRow key={usuario.id}>
              <TableCell className="font-medium">{usuario.full_name}</TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>
                {isSelf ? (
                  <Badge variant="info">{usuario.role === "admin" ? "Admin" : "Comercial"}</Badge>
                ) : (
                  <Select
                    value={usuario.role}
                    disabled={isSaving}
                    onChange={(e) => handleRoleChange(usuario, e.target.value as Role)}
                    options={ROLE_OPTIONS}
                    className="h-9 w-36"
                  />
                )}
              </TableCell>
              <TableCell>
                {isSelf ? (
                  <Badge variant={usuario.is_active ? "success" : "default"}>
                    {usuario.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleToggleActive(usuario)}
                    className="disabled:opacity-50"
                  >
                    <Badge variant={usuario.is_active ? "success" : "default"}>
                      {usuario.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </button>
                )}
                {error && <p className="mt-1 text-xs text-temp-quente">{error}</p>}
              </TableCell>
              <TableCell className="text-brand-graphite-light">
                {dateFormatter.format(new Date(usuario.created_at))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
