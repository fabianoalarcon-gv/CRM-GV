import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency } from "../utils";
import { CardIcon } from "./CardIcon";
import type { DashboardProposta } from "../types";

function statusVariant(p: DashboardProposta): "info" | "success" | "danger" | "default" {
  if (p.status_key !== "fechado") return "info";
  if (p.resultado === "aprovado") return "success";
  if (p.resultado === "reprovado") return "danger";
  return "default";
}

function statusLabel(p: DashboardProposta): string {
  if (p.status_key === "fechado" && p.resultado) {
    return `${p.status_label} · ${p.resultado === "aprovado" ? "Aprovado" : "Reprovado"}`;
  }
  return p.status_label;
}

export interface RankingTableProps {
  propostas: DashboardProposta[];
}

export function RankingTable({ propostas }: RankingTableProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <CardIcon name="leaderboard" color="var(--color-temp-morno)" />
          <div>
            <CardDescription>Ranking</CardDescription>
            <CardTitle className="mt-1 font-display text-base">Propostas de maior valor</CardTitle>
          </div>
        </div>

        {propostas.length === 0 ? (
          <p className="text-sm text-brand-graphite-light">Nenhuma proposta no período selecionado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propostas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.numero_proposta}</TableCell>
                  <TableCell>{p.cliente_nome}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p)}>{statusLabel(p)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono font-semibold">{formatCurrency(p.valor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
