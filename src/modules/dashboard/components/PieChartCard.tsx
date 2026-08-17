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

// Paleta categórica do Dashboard (globals.css) — hex fixo aqui só pra decidir
// o contraste do texto de percentual sobre cada fatia (app é tema claro fixo,
// sem theming em runtime, então não há necessidade de ler a CSS var).
const SLICE_COLORS = [
  { cssVar: "var(--color-chart-cat-1)", hex: "#2a78d6" },
  { cssVar: "var(--color-chart-cat-2)", hex: "#eb6834" },
  { cssVar: "var(--color-chart-cat-3)", hex: "#1baf7a" },
  { cssVar: "var(--color-chart-cat-4)", hex: "#eda100" },
  { cssVar: "var(--color-chart-cat-5)", hex: "#e87ba4" },
];
const NEUTRAL_COLOR = { cssVar: "var(--color-brand-route)", hex: "#94a3b8" };

// Só "Sem X" (segmento/serviço não informado) fica em cinza neutro — "Outros"
// representa serviços de verdade (fora do top N) e entra no rodízio de cores
// normal, senão ficaria com a mesma cor de "Sem serviço" no mesmo gráfico.
function isNeutralKey(key: string): boolean {
  return key.startsWith("sem_");
}

function textColorOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.45 ? "#0b1c30" : "#ffffff";
}

const SIZE = 160;
const RADIUS = SIZE / 2;
const CENTER = RADIUS;
const GAP_DEG = 2;
const LABEL_RADIUS = RADIUS * 0.62;
const MIN_LABEL_SPAN_DEG = 28;

function point(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) };
}

function slicePath(startDeg: number, endDeg: number): string {
  const start = point(startDeg, RADIUS);
  const end = point(endDeg, RADIUS);
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
          <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              className="shrink-0"
              role="img"
              aria-label={subtitle}
            >
              {isSingleSlice ? (
                <>
                  <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={slices[0].color.cssVar} />
                  <text
                    x={CENTER}
                    y={CENTER}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={16}
                    fontWeight={600}
                    fill={textColorOn(slices[0].color.hex)}
                  >
                    100%
                  </text>
                </>
              ) : (
                slices.map((slice) => {
                  // Fatias muito finas com o gap fixo invertem o arco — encolhe o
                  // gap proporcionalmente pra nunca ultrapassar o próprio ângulo.
                  const span = slice.end - slice.start;
                  const gap = Math.min(GAP_DEG, span * 0.3);
                  const labelPos = point((slice.start + slice.end) / 2, LABEL_RADIUS);
                  return (
                    <g key={slice.key}>
                      <path
                        d={slicePath(slice.start + gap / 2, slice.end - gap / 2)}
                        fill={slice.color.cssVar}
                      />
                      {span >= MIN_LABEL_SPAN_DEG && (
                        <text
                          x={labelPos.x}
                          y={labelPos.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={11}
                          fontWeight={600}
                          fill={textColorOn(slice.color.hex)}
                        >
                          {Math.round(slice.pct * 100)}%
                        </text>
                      )}
                    </g>
                  );
                })
              )}
            </svg>

            <div className="flex w-full min-w-0 flex-col gap-2">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color.cssVar }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                    <p className="font-mono text-xs text-brand-graphite-light">
                      {formatBreakdownLegend(item.count, item.valor)}
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
