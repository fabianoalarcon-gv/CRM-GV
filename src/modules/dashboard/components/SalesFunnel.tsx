import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import type { StatusAggregate } from "../utils";

export interface SalesFunnelProps {
  aggregates: StatusAggregate[];
}

const STAGE_STYLE = [
  { bg: "#fbd6ae", text: "text-brand-navy" },
  { bg: "var(--color-brand-accent)", text: "text-white" },
  { bg: "var(--color-brand-accent-dark)", text: "text-white" },
];

export function SalesFunnel({ aggregates }: SalesFunnelProps) {
  const emAnalise = aggregates.find((a) => a.status === "em_analise")?.count ?? 0;
  const aprovado = aggregates.find((a) => a.status === "aprovado")?.count ?? 0;
  const reprovado = aggregates.find((a) => a.status === "reprovado")?.count ?? 0;
  const total = emAnalise + aprovado + reprovado;

  const stages = [
    { label: "Propostas enviadas", count: total },
    { label: "Em análise ou aprovadas", count: emAnalise + aprovado },
    { label: "Aprovadas", count: aprovado },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <CardDescription>Funil de vendas</CardDescription>
          <CardTitle className="mt-1 font-display text-base">Da proposta ao fechamento</CardTitle>
        </div>

        {total === 0 ? (
          <p className="text-sm text-brand-graphite-light">Nenhuma proposta no período selecionado.</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {stages.map((stage, i) => {
              const pct = total > 0 ? (stage.count / total) * 100 : 0;
              const style = STAGE_STYLE[i];
              return (
                <div key={stage.label} className="flex w-full flex-col items-center gap-1">
                  <div
                    className={`flex h-11 items-center justify-center rounded-md text-sm font-semibold ${style.text}`}
                    style={{ width: `${Math.max(pct, 12)}%`, backgroundColor: style.bg }}
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
