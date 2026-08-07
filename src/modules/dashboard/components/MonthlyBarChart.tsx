import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatCompactCurrency, type MonthlyAggregate } from "../utils";

export interface MonthlyBarChartProps {
  monthly: MonthlyAggregate[];
}

export function MonthlyBarChart({ monthly }: MonthlyBarChartProps) {
  if (monthly.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div>
            <CardDescription>Propostas por mês</CardDescription>
            <CardTitle className="mt-1 font-display text-base">Volume enviado ao longo do tempo</CardTitle>
          </div>
          <p className="text-sm text-brand-graphite-light">Nenhuma proposta no período selecionado.</p>
        </CardContent>
      </Card>
    );
  }

  const maxValor = Math.max(1, ...monthly.map((m) => m.valor));

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <CardDescription>Propostas por mês</CardDescription>
          <CardTitle className="mt-1 font-display text-base">Volume enviado ao longo do tempo</CardTitle>
        </div>

        <div className="flex h-48 items-end justify-around gap-3 border-b border-border pb-0">
          {monthly.map((m) => {
            const heightPct = (m.valor / maxValor) * 100;
            return (
              <div key={m.monthKey} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[11px] font-medium text-foreground">
                  {formatCompactCurrency(m.valor)}
                </span>
                <div
                  className="w-6 rounded-t-[4px] bg-brand-accent sm:w-8"
                  style={{ height: `${Math.max(heightPct, 3)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-around gap-3">
          {monthly.map((m) => (
            <span key={m.monthKey} className="flex-1 text-center text-xs text-brand-graphite-light capitalize">
              {m.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
