import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RouteLine } from "@/components/ui/RouteLine";
import { cn } from "@/lib/cn";

const kpis = [
  { label: "Valor total em propostas", value: "R$ 0,00", primary: true },
  { label: "Em análise", value: "R$ 0,00" },
  { label: "Aprovado", value: "R$ 0,00" },
  { label: "Reprovado", value: "R$ 0,00" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Visão geral
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Dashboard Comercial
        </h1>
        <p className="mt-2 text-sm text-brand-graphite-light">
          Acompanhamento do pipeline de propostas da Granvale Logística.
        </p>
      </div>

      <div className="hidden lg:block">
        <RouteLine stops={kpis.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className={cn(
              kpi.primary && "border-brand-accent/30 bg-brand-accent/5 dark:bg-brand-accent/10",
            )}
          >
            <CardHeader className={cn(kpi.primary && "gap-2")}>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle
                className={cn(
                  "font-mono tabular-nums",
                  kpi.primary
                    ? "text-3xl text-brand-accent-dark dark:text-brand-accent"
                    : "text-2xl",
                )}
              >
                {kpi.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Módulos em construção</CardTitle>
          <CardDescription>
            Os dados reais aparecerão aqui assim que os módulos de Banco de Dados (DB) e Pipeline
            Comercial (PIPE) forem implementados.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="frio">Frio</Badge>
          <Badge variant="morno">Morno</Badge>
          <Badge variant="quente">Quente</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
