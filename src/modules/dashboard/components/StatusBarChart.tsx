import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatCompactCurrency, STATUS_COLORS, type StatusAggregate } from "../utils";

export interface StatusBarChartProps {
  aggregates: StatusAggregate[];
}

export function StatusBarChart({ aggregates }: StatusBarChartProps) {
  const maxValor = Math.max(1, ...aggregates.map((a) => a.valor));

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <CardDescription>Propostas por status</CardDescription>
          <CardTitle className="mt-1 font-display text-base">Valor por etapa do pipeline</CardTitle>
        </div>

        <div className="flex flex-col gap-3">
          {aggregates.map((agg) => {
            const pct = (agg.valor / maxValor) * 100;
            return (
              <div key={agg.status} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-foreground">{agg.label}</span>
                <div className="h-6 flex-1 rounded-full bg-black/[.04]">
                  <div
                    className="h-6 rounded-full transition-[width]"
                    style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[agg.status] }}
                  />
                </div>
                <span className="w-36 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">
                  {formatCompactCurrency(agg.valor)}{" "}
                  <span className="text-brand-graphite-light">
                    · {agg.count} {agg.count === 1 ? "proposta" : "propostas"}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
