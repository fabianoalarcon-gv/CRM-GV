import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency } from "../utils";
import type { DashboardProposta, StatusKey } from "../types";

const STATUS_BADGE_VARIANT: Record<StatusKey, "info" | "success" | "danger"> = {
  em_analise: "info",
  aprovado: "success",
  reprovado: "danger",
};

export interface RankingTableProps {
  propostas: DashboardProposta[];
}

export function RankingTable({ propostas }: RankingTableProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <CardDescription>Ranking</CardDescription>
          <CardTitle className="mt-1 font-display text-base">Propostas de maior valor</CardTitle>
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
                    <Badge variant={STATUS_BADGE_VARIANT[p.status_key]}>{p.status_label}</Badge>
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
