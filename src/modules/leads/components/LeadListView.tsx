"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { SEGMENTO_LABEL, type Proposta } from "@/modules/pipeline/types";
import { useLeadsData } from "../context";
import { LeadDetailModal } from "./LeadDetailModal";

const TERMOMETRO_LABEL: Record<Proposta["termometro"], string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function LeadListView({ propostas }: { propostas: Proposta[] }) {
  const { statuses } = useLeadsData();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = propostas.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Termômetro</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead>Valor estimado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {propostas.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-brand-graphite-light">
                Nenhum lead encontrado.
              </TableCell>
            </TableRow>
          )}
          {propostas.map((proposta) => (
            <TableRow
              key={proposta.id}
              className="cursor-pointer"
              onClick={() => setSelectedId(proposta.id)}
            >
              <TableCell className="font-mono text-xs">{proposta.numero_lead}</TableCell>
              <TableCell>{proposta.empresa_nome}</TableCell>
              <TableCell>{statuses.find((s) => s.id === proposta.status_id)?.label ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={proposta.termometro}>{TERMOMETRO_LABEL[proposta.termometro]}</Badge>
              </TableCell>
              <TableCell>{proposta.segmento ? SEGMENTO_LABEL[proposta.segmento] : "—"}</TableCell>
              <TableCell className="font-mono font-semibold">
                {proposta.valor != null ? currencyFormatter.format(proposta.valor) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected && <LeadDetailModal proposta={selected} isOpen onClose={() => setSelectedId(null)} />}
    </>
  );
}
