"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { usePipelineData } from "../context";
import { ProposalDetailModal } from "./ProposalDetailModal";
import type { Proposta } from "../types";

const TERMOMETRO_LABEL: Record<Proposta["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProposalListView({ propostas }: { propostas: Proposta[] }) {
  const { statuses } = usePipelineData();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = propostas.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Termômetro</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {propostas.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-brand-graphite-light">
                Nenhuma proposta encontrada.
              </TableCell>
            </TableRow>
          )}
          {propostas.map((proposta) => (
            <TableRow
              key={proposta.id}
              className="cursor-pointer"
              onClick={() => setSelectedId(proposta.id)}
            >
              <TableCell className="font-mono text-xs">
                {proposta.numero_proposta ?? proposta.numero_lead ?? "—"}
              </TableCell>
              <TableCell>{proposta.cliente_nome}</TableCell>
              <TableCell>{statuses.find((s) => s.id === proposta.status_id)?.label ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={proposta.termometro}>{TERMOMETRO_LABEL[proposta.termometro]}</Badge>
              </TableCell>
              <TableCell className="font-mono font-semibold">
                {proposta.valor != null ? currencyFormatter.format(proposta.valor) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected && (
        <ProposalDetailModal proposta={selected} isOpen onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
