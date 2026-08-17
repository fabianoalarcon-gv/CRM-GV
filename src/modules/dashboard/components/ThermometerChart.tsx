import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatBreakdownLegend, type TermometroBreakdown } from "../utils";
import { CardIcon } from "./CardIcon";

export interface ThermometerChartProps {
  data: TermometroBreakdown[];
}

const COLOR_BY_TERMOMETRO: Record<
  TermometroBreakdown["termometro"],
  { cssVar: string; hex: string }
> = {
  frio: { cssVar: "var(--color-temp-frio)", hex: "#38bdf8" },
  morno: { cssVar: "var(--color-temp-morno)", hex: "#facc15" },
  quente: { cssVar: "var(--color-temp-quente)", hex: "#ef4444" },
};

// Container tem 192px (h-48) — abaixo de ~13% a faixa fica curta demais pro
// texto do percentual caber sem estourar a borda.
const TUBE_HEIGHT_PX = 192;
const MIN_LABEL_PCT = 0.13;

function textColorOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.45 ? "#0b1c30" : "#ffffff";
}

function Band({ pct, color }: { pct: number; color: { cssVar: string; hex: string } }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: `${pct * 100}%`, backgroundColor: color.cssVar }}
    >
      {pct >= MIN_LABEL_PCT && (
        <span className="text-[11px] font-semibold" style={{ color: textColorOn(color.hex) }}>
          {Math.round(pct * 100)}%
        </span>
      )}
    </div>
  );
}

export function ThermometerChart({ data }: ThermometerChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const frio = data.find((d) => d.termometro === "frio");
  const morno = data.find((d) => d.termometro === "morno");
  const quente = data.find((d) => d.termometro === "quente");

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 px-5 pt-6 pb-5">
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
              <div
                className="flex w-10 flex-col-reverse overflow-hidden rounded-full border border-border bg-background"
                style={{ height: TUBE_HEIGHT_PX }}
              >
                <Band pct={frio?.pct ?? 0} color={COLOR_BY_TERMOMETRO.frio} />
                <Band pct={morno?.pct ?? 0} color={COLOR_BY_TERMOMETRO.morno} />
                <Band pct={quente?.pct ?? 0} color={COLOR_BY_TERMOMETRO.quente} />
              </div>
              <div
                className="-mt-5 h-10 w-10 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: COLOR_BY_TERMOMETRO.frio.cssVar }}
              />
            </div>

            <div className="flex w-full min-w-0 flex-col gap-3">
              {data.map((item) => (
                <div key={item.termometro} className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLOR_BY_TERMOMETRO[item.termometro].cssVar }}
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
