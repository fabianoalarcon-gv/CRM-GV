import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface KpiCardProps {
  label: string;
  value: string;
  caption?: string;
  accent?: boolean;
  valueClassName?: string;
}

export function KpiCard({ label, value, caption, accent, valueClassName }: KpiCardProps) {
  return (
    <Card className={cn(accent && "border-brand-accent/30 bg-brand-accent/5")}>
      <CardHeader className={cn(accent && "gap-2")}>
        <CardDescription>{label}</CardDescription>
        <CardTitle
          className={cn(
            "font-mono tabular-nums",
            accent ? "text-3xl text-brand-accent-dark" : "text-2xl",
            valueClassName,
          )}
        >
          {value}
        </CardTitle>
        {caption && <p className="text-xs text-brand-graphite-light">{caption}</p>}
      </CardHeader>
    </Card>
  );
}
