import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { CardIcon } from "./CardIcon";

export interface KpiCardProps {
  label: string;
  value: string;
  caption?: string;
  accent?: boolean;
  icon: string;
  color: string;
  valueClassName?: string;
}

export function KpiCard({ label, value, caption, accent, icon, color, valueClassName }: KpiCardProps) {
  return (
    <Card className={cn(accent && "border-brand-accent/30 bg-brand-accent/5")}>
      <CardContent className="flex items-center gap-3 p-4">
        <CardIcon name={icon} color={color} />
        <div className="min-w-0 flex-1">
          <CardDescription>{label}</CardDescription>
          <CardTitle
            className={cn(
              "font-mono tabular-nums",
              accent ? "text-2xl text-brand-accent-dark" : "text-xl",
              valueClassName,
            )}
          >
            {value}
          </CardTitle>
          {caption && <p className="mt-1 text-xs text-brand-graphite-light">{caption}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
