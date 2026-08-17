import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatBreakdownLegend, type TermometroBreakdown } from "../utils";
import { CardIcon } from "./CardIcon";

export interface ThermometerChartProps {
  data: TermometroBreakdown[];
}

const COLOR_BY_TERMOMETRO: Record<TermometroBreakdown["termometro"], string> = {
  frio: "var(--color-temp-frio)",
  morno: "var(--color-temp-morno)",
  quente: "var(--color-temp-quente)",
};

export function ThermometerChart({ data }: ThermometerChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const frio = data.find((d) => d.termometro === "frio");
  const morno = data.find((d) => d.termometro === "morno");
  const quente = data.find((d) => d.termometro === "quente");

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <CardIcon name="thermostat" color="var(--color-temp-quente)" />
          <div>
            <CardDescription>Termômetro</CardDescription>
            <CardTitle className="mt-1 font-display text-base">Propostas por temperatura</CardTitle>
          </div>
        </div>

        {total === 0 ? (
          <p className="text-sm text-brand-graphite-light">
            Nenhuma proposta no período selecionado.
          </p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="flex shrink-0 flex-col items-center">
              <div className="flex h-48 w-7 flex-col-reverse overflow-hidden rounded-full border border-border bg-background">
                <div
                  style={{
                    height: `${(frio?.pct ?? 0) * 100}%`,
                    backgroundColor: COLOR_BY_TERMOMETRO.frio,
                  }}
                />
                <div
                  style={{
                    height: `${(morno?.pct ?? 0) * 100}%`,
                    backgroundColor: COLOR_BY_TERMOMETRO.morno,
                  }}
                />
                <div
                  style={{
                    height: `${(quente?.pct ?? 0) * 100}%`,
                    backgroundColor: COLOR_BY_TERMOMETRO.quente,
                  }}
                />
              </div>
              <div
                className="-mt-3.5 h-7 w-7 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: COLOR_BY_TERMOMETRO.frio }}
              />
            </div>

            <div className="flex w-full min-w-0 flex-col gap-4">
              {data.map((item) => (
                <div key={item.termometro} className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLOR_BY_TERMOMETRO[item.termometro] }}
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
