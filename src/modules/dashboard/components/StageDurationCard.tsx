import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import type { StageDuration } from "../utils";
import { CardIcon } from "./CardIcon";

export interface StageDurationCardProps {
  stages: StageDuration[];
}

const COLOR_BY_STATUS: Record<string, string> = {
  prospeccao: "var(--color-chart-cat-1)",
  negociacao: "var(--color-chart-cat-2)",
};

export function StageDurationCard({ stages }: StageDurationCardProps) {
  const total = stages.reduce((sum, s) => sum + s.amostras, 0);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <CardIcon name="schedule" color="var(--color-cal-followup)" />
          <div>
            <CardDescription>Tempo por etapa</CardDescription>
            <CardTitle className="mt-1 font-display text-base">
              Permanência do Lead em cada etapa
            </CardTitle>
          </div>
        </div>

        {total === 0 ? (
          <p className="text-sm text-brand-graphite-light">
            Nenhum Lead com histórico de etapa no período selecionado.
          </p>
        ) : (
          <div className="grid flex-1 grid-cols-2 gap-4">
            {stages.map((s) => (
              <div
                key={s.status}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border px-3 py-4 text-center"
              >
                <span
                  className="font-mono text-2xl font-semibold tabular-nums"
                  style={{ color: COLOR_BY_STATUS[s.status] ?? "var(--color-brand-accent)" }}
                >
                  {s.amostras > 0 ? s.avgDays.toFixed(1) : "—"}
                </span>
                <span className="text-xs text-brand-graphite-light">
                  {s.amostras > 0 ? "dias em média" : "sem dados"}
                </span>
                <span className="mt-1 text-sm font-medium text-foreground">{s.label}</span>
                <span className="text-xs text-brand-graphite-light">
                  {s.amostras} lead{s.amostras === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
