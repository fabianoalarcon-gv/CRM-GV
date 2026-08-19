import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatCompactCurrency, type MonthlyAggregate } from "../utils";
import { CardIcon } from "./CardIcon";

export interface MonthlyBarChartProps {
  monthly: MonthlyAggregate[];
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  emptyMessage?: string;
  // "valor" soma R$ por mês (uso original: propostas); "count" conta
  // registros por mês (uso de Leads, onde muita coisa ainda não tem valor).
  metric?: "valor" | "count";
}

function Header({
  title,
  subtitle,
  icon,
  iconColor,
}: Required<Pick<MonthlyBarChartProps, "title" | "subtitle" | "icon" | "iconColor">>) {
  return (
    <div className="flex items-center gap-3">
      <CardIcon name={icon} color={iconColor} />
      <div>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="mt-1 font-display text-base">{subtitle}</CardTitle>
      </div>
    </div>
  );
}

export function MonthlyBarChart({
  monthly,
  title = "Propostas por mês",
  subtitle = "Volume enviado ao longo do tempo",
  icon = "calendar_month",
  iconColor = "var(--color-cal-reuniao)",
  emptyMessage = "Nenhuma proposta no período selecionado.",
  metric = "valor",
}: MonthlyBarChartProps) {
  if (monthly.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 px-5 pt-6 pb-5">
          <Header title={title} subtitle={subtitle} icon={icon} iconColor={iconColor} />
          <p className="text-sm text-brand-graphite-light">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const metricValue = (m: MonthlyAggregate) => (metric === "count" ? m.count : m.valor);
  const formatMetric = (m: MonthlyAggregate) =>
    metric === "count" ? `${m.count}` : formatCompactCurrency(m.valor);
  const maxValor = Math.max(1, ...monthly.map(metricValue));

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-5 pt-6 pb-5">
        <Header title={title} subtitle={subtitle} icon={icon} iconColor={iconColor} />

        <div className="flex h-48 items-end justify-around gap-3 border-b border-border pb-0">
          {monthly.map((m) => {
            const heightPct = (metricValue(m) / maxValor) * 100;
            return (
              <div
                key={m.monthKey}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-[11px] font-medium text-foreground">{formatMetric(m)}</span>
                <div
                  className="w-6 rounded-t-[4px] bg-brand-accent sm:w-8"
                  style={{ height: `${Math.max(heightPct, 3)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-around gap-3">
          {monthly.map((m) => (
            <span
              key={m.monthKey}
              className="flex-1 text-center text-xs text-brand-graphite-light capitalize"
            >
              {m.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
