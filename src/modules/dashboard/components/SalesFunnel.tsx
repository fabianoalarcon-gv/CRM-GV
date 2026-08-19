import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCompactCurrency, type FunnelStage } from "../utils";
import { CardIcon } from "./CardIcon";

export interface SalesFunnelProps {
  stages: FunnelStage[];
}

export function SalesFunnel({ stages }: SalesFunnelProps) {
  const total = stages[0]?.count ?? 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <CardIcon name="filter_alt" color="var(--color-brand-accent)" />
          <div>
            <CardDescription>Funil de vendas</CardDescription>
            <CardTitle className="mt-1 font-display text-base">Da proposta ao fechamento</CardTitle>
          </div>
        </div>

        {total === 0 ? (
          <p className="text-sm text-brand-graphite-light">
            Nenhuma proposta no período selecionado.
          </p>
        ) : (
          <div className="flex flex-col items-center">
            {stages.map((stage, i) => {
              const widthPct = Math.max((stage.count / total) * 100, 46);
              const isLast = i === stages.length - 1;
              const next = stages[i + 1];
              const conversion = next && stage.count > 0 ? next.count / stage.count : null;

              return (
                <div key={stage.status} className="flex w-full flex-col items-center">
                  <div
                    className="flex h-12 items-center justify-between gap-3 px-5 text-sm font-semibold text-white"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: isLast
                        ? "var(--color-brand-accent)"
                        : "var(--color-brand-navy)",
                      clipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)",
                    }}
                  >
                    <span className="shrink-0 truncate">{stage.label}</span>
                    <span className="min-w-0 truncate font-mono text-xs font-medium opacity-90">
                      {stage.count} · {formatCompactCurrency(stage.valor)}
                    </span>
                  </div>

                  {!isLast && (
                    <div className="z-10 -my-2.5 flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-brand-graphite shadow-sm">
                      {conversion !== null ? `${(conversion * 100).toFixed(0)}%` : "—"}
                      <Icon name="arrow_downward" size={13} className="text-brand-graphite-light" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
