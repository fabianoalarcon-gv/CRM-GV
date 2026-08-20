import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { TermometroBadge } from "@/modules/pipeline/components/TermometroBadge";
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
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  emptyMessage?: string;
}

export function RankingTable({
  propostas,
  title = "Ranking Top 5",
  subtitle = "Propostas de maior valor",
  icon = "leaderboard",
  iconColor = "var(--color-temp-morno)",
  emptyMessage = "Nenhuma proposta no período selecionado.",
}: RankingTableProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <CardIcon name={icon} color={iconColor} />
          <div>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="mt-1 font-display text-base">{subtitle}</CardTitle>
          </div>
        </div>

        {propostas.length === 0 ? (
          <p className="text-sm text-brand-graphite-light">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Termômetro</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propostas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">
                    {p.numero_proposta ?? p.numero_lead ?? "—"}
                  </TableCell>
                  <TableCell>{p.empresa_nome}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p)}>{statusLabel(p)}</Badge>
                  </TableCell>
                  <TableCell>{p.termometro ? <TermometroBadge value={p.termometro} /> : "—"}</TableCell>
                  <TableCell className="font-mono font-semibold">
                    {formatCurrency(p.valor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
