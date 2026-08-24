import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { CardIcon } from "./CardIcon";

export interface LineSeriesDef<T> {
  key: string;
  label: string;
  color: string;
  value: (point: T) => number;
}

export interface LineChartCardProps<T extends { monthKey: string; label: string }> {
  data: T[];
  series: LineSeriesDef<T>[];
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  emptyMessage?: string;
}

const WIDTH = 480;
const HEIGHT = 160;
const PADDING_X = 12;

export function LineChartCard<T extends { monthKey: string; label: string }>({
  data,
  series,
  title,
  subtitle,
  icon,
  iconColor,
  emptyMessage = "Nenhum dado no período selecionado.",
}: LineChartCardProps<T>) {
  const maxValue = Math.max(1, ...data.flatMap((d) => series.map((s) => s.value(d))));

  const stepX = data.length > 1 ? (WIDTH - PADDING_X * 2) / (data.length - 1) : 0;
  const xAt = (i: number) => (data.length > 1 ? PADDING_X + i * stepX : WIDTH / 2);
  const yAt = (value: number) => HEIGHT - (value / maxValue) * (HEIGHT - 8) - 4;

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <CardIcon name={icon} color={iconColor} />
          <div>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="mt-1 font-display text-base">{subtitle}</CardTitle>
          </div>
        </div>

        {data.length === 0 ? (
          <p className="text-sm text-brand-graphite-light">{emptyMessage}</p>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-48 w-full border-b border-border"
              preserveAspectRatio="none"
              role="img"
              aria-label={subtitle}
            >
              {series.map((s) => {
                const points = data.map((d, i) => `${xAt(i)},${yAt(s.value(d))}`).join(" ");
                return (
                  <g key={s.key}>
                    <polyline
                      points={points}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {data.map((d, i) => (
                      <circle key={d.monthKey} cx={xAt(i)} cy={yAt(s.value(d))} r={3} fill={s.color} />
                    ))}
                  </g>
                );
              })}
            </svg>

            <div className="flex justify-around gap-3">
              {data.map((d) => (
                <span
                  key={d.monthKey}
                  className="flex-1 text-center text-xs text-brand-graphite-light capitalize"
                >
                  {d.label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
              {series.map((s) => {
                const total = data.reduce((sum, d) => sum + s.value(d), 0);
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <p className="text-sm font-medium text-foreground">
                      {s.label}{" "}
                      <span className="font-mono text-xs text-brand-graphite-light">({total})</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
