import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const kpis = [
  { label: "Valor total em propostas", value: "R$ 0,00" },
  { label: "Em análise", value: "R$ 0,00" },
  { label: "Aprovado", value: "R$ 0,00" },
  { label: "Reprovado", value: "R$ 0,00" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard Comercial</h1>
        <p className="mt-1 text-sm text-brand-graphite-light">
          Visão geral do pipeline de propostas da Granvale Logística.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulos em construção</CardTitle>
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
