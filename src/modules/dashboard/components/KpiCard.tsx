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
  borderClassName?: string;
}

export function KpiCard({
  label,
  value,
  caption,
  accent,
  icon,
  color,
  valueClassName,
  borderClassName,
}: KpiCardProps) {
  return (
    <Card className={cn("h-full", borderClassName)}>
      <CardContent className="flex h-full items-center justify-center gap-3 px-4 pt-6 pb-4">
        <CardIcon name={icon} color={color} />
        <div className="min-w-0">
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
