"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import type { Cliente } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export interface ClientesTableProps {
  clientes: Cliente[];
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [setor, setSetor] = useState("");

  const setores = useMemo(() => {
    const unique = new Set(clientes.map((c) => c.setor).filter((s): s is string => !!s));
    return Array.from(unique).sort();
  }, [clientes]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clientes.filter((c) => {
      const matchesSearch = !query || c.nome.toLowerCase().includes(query);
      const matchesSetor = !setor || c.setor === setor;
      return matchesSearch && matchesSetor;
    });
  }, [clientes, search, setor]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
          options={setores.map((s) => ({ value: s, label: s }))}
          placeholder="Todos os setores"
          className="max-w-xs"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Cadastrado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-brand-graphite-light">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
          {filtered.map((cliente) => (
            <TableRow
              key={cliente.id}
              className="cursor-pointer"
              onClick={() => router.push(`/clientes/${cliente.id}`)}
            >
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.setor ?? "—"}</TableCell>
              <TableCell>{cliente.endereco ?? "—"}</TableCell>
              <TableCell>{dateFormatter.format(new Date(cliente.created_at))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
