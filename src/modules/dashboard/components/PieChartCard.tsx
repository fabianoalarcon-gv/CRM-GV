import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatBreakdownLegend, type CategoryBreakdown } from "../utils";
import { CardIcon } from "./CardIcon";

export interface PieChartCardProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  emptyMessage?: string;
  data: CategoryBreakdown[];
}

const SLICE_COLORS = [
  "var(--color-chart-cat-1)",
  "var(--color-chart-cat-2)",
  "var(--color-chart-cat-3)",
  "var(--color-chart-cat-4)",
  "var(--color-chart-cat-5)",
];
const NEUTRAL_COLOR = "var(--color-brand-route)";

function isNeutralKey(key: string): boolean {
  return key === "outros" || key.startsWith("sem_");
}

const SIZE = 160;
const RADIUS = SIZE / 2;
const CENTER = RADIUS;
const GAP_DEG = 2;

function point(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.sin(rad), y: CENTER - RADIUS * Math.cos(rad) };
}

function slicePath(startDeg: number, endDeg: number): string {
  const start = point(startDeg);
  const end = point(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

export function PieChartCard({
  title,
  subtitle,
  icon,
  iconColor,
  emptyMessage = "Nenhuma proposta no período selecionado.",
  data,
}: PieChartCardProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const items = data.map((d, i) => {
    const colorPoolIndex = data.slice(0, i).filter((x) => !isNeutralKey(x.key)).length;
    return {
      ...d,
      color: isNeutralKey(d.key)
        ? NEUTRAL_COLOR
        : SLICE_COLORS[colorPoolIndex % SLICE_COLORS.length],
    };
  });

  const slicesWithCount = items.filter((d) => d.count > 0);
  const angles = slicesWithCount.map((item) => (item.count / total) * 360);

  const slices = slicesWithCount.map((item, i) => {
    const start = angles.slice(0, i).reduce((a, b) => a + b, 0);
    const end = start + angles[i];
    return { ...item, start, end };
  });

  const isSingleSlice = slicesWithCount.length === 1;

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

        {total === 0 ? (
          <p className="text-sm text-brand-graphite-light">{emptyMessage}</p>
        ) : (
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              className="shrink-0"
              role="img"
              aria-label={subtitle}
            >
              {isSingleSlice ? (
                <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={slices[0].color} />
              ) : (
                slices.map((slice) => {
                  // Fatias muito finas com o gap fixo invertem o arco — encolhe o
                  // gap proporcionalmente pra nunca ultrapassar o próprio ângulo.
                  const span = slice.end - slice.start;
                  const gap = Math.min(GAP_DEG, span * 0.3);
                  return (
                    <path
                      key={slice.key}
                      d={slicePath(slice.start + gap / 2, slice.end - gap / 2)}
                      fill={slice.color}
                    />
                  );
                })
              )}
            </svg>

            <div className="flex w-full min-w-0 flex-col gap-2.5">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                    <p className="font-mono text-xs text-brand-graphite-light">
                      {formatBreakdownLegend(item.count, item.valor, item.pct)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
