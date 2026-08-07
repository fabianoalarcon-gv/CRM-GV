import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { STATUS_COLORS, type FunnelStage } from "../utils";

export interface SalesFunnelProps {
  stages: FunnelStage[];
}

export function SalesFunnel({ stages }: SalesFunnelProps) {
  const total = stages[0]?.count ?? 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <CardDescription>Funil de vendas</CardDescription>
          <CardTitle className="mt-1 font-display text-base">Da prospecção ao fechamento</CardTitle>
        </div>

        {total === 0 ? (
          <p className="text-sm text-brand-graphite-light">Nenhuma proposta no período selecionado.</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {stages.map((stage) => {
              const pct = stage.pct * 100;
              const color = STATUS_COLORS[stage.status];
              return (
                <div key={stage.status} className="flex w-full flex-col items-center gap-1">
                  <div
                    className="flex h-10 items-center justify-center rounded-md text-sm font-semibold text-white"
                    style={{ width: `${Math.max(pct, 14)}%`, backgroundColor: color }}
                  >
                    {stage.count} <span className="ml-1 font-normal opacity-80">({pct.toFixed(0)}%)</span>
                  </div>
                  <span className="text-xs text-brand-graphite-light">{stage.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
