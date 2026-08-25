import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatBreakdownLegend, type CategoryBreakdown } from "../utils";
import { CardIcon } from "./CardIcon";

export interface SegmentoBarChartProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  emptyMessage?: string;
  data: CategoryBreakdown[];
}

// Mesma paleta categórica do PieChartCard, pra manter a identidade visual —
// mas aqui em barras, não em pizza: como um Lead/Proposta pode ter mais de um
// segmento (multi-seleção), os percentuais de `data` não somam 100% entre si,
// e uma pizza forçaria os ângulos a fechar 360° de um jeito que não bate com
// o % escrito em cada fatia. Barras horizontais não têm esse problema: cada
// uma mostra seu próprio percentual (0-100%) de forma independente.
const BAR_COLORS = [
  "var(--color-chart-cat-1)",
  "var(--color-chart-cat-2)",
  "var(--color-chart-cat-3)",
  "var(--color-chart-cat-4)",
  "var(--color-chart-cat-5)",
];
const NEUTRAL_COLOR = "var(--color-brand-route)";

function isNeutralKey(key: string): boolean {
  return key.startsWith("sem_");
}

export function SegmentoBarChart({
  title,
  subtitle,
  icon,
  iconColor,
  emptyMessage = "Nenhuma proposta no período selecionado.",
  data,
}: SegmentoBarChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const items = data.map((d, i) => {
    const colorPoolIndex = data.slice(0, i).filter((x) => !isNeutralKey(x.key)).length;
    return {
      ...d,
      color: isNeutralKey(d.key) ? NEUTRAL_COLOR : BAR_COLORS[colorPoolIndex % BAR_COLORS.length],
    };
  });

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <CardIcon name={icon} color={iconColor} />
          <div>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="mt-1 font-display text-base">{subtitle}</CardTitle>
          </div>
        </div>

        {total === 0 ? (
          <p className="text-sm text-brand-graphite-light">{emptyMessage}</p>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-3">
            {items.map((item) => (
              <div key={item.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
                  <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
                    {Math.round(item.pct * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(item.pct * 100, 2)}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="font-mono text-xs text-brand-graphite-light">
                  {formatBreakdownLegend(item.count, item.valor)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
