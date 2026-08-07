import { cn } from "@/lib/cn";

export interface RouteLineProps {
  stops: number;
  className?: string;
}

/**
 * Linha de "rota" com waypoints — elemento assinatura do LogiHub, ecoando o
 * ícone de circuito do logo. Usado para conectar visualmente cards em sequência
 * (ex: KPIs, etapas do pipeline).
 */
export function RouteLine({ stops, className }: RouteLineProps) {
  const positions = Array.from({ length: stops }, (_, i) => (100 / stops) * (i + 0.5));

  return (
    <div aria-hidden className={cn("relative h-4 w-full", className)}>
      <div className="absolute inset-x-[6%] top-1/2 border-t border-dashed border-brand-route" />
      {positions.map((left, i) => (
        <span
          key={i}
          style={{ left: `${left}%` }}
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-route"
        />
      ))}
    </div>
  );
}
