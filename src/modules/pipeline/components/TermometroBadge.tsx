import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import type { Termometro } from "../types";

const TERMOMETRO_CONFIG: Record<Termometro, { label: string; icon: string }> = {
  frio: { label: "Frio", icon: "ac_unit" },
  morno: { label: "Morno", icon: "wb_sunny" },
  quente: { label: "Quente", icon: "local_fire_department" },
};

// Cor sólida por temperatura — usada na linha de destaque no topo do card,
// além da badge (que usa um tom translúcido via Badge/globals.css).
export const TERMOMETRO_COLOR: Record<Termometro, string> = {
  frio: "var(--color-temp-frio)",
  morno: "var(--color-temp-morno)",
  quente: "var(--color-temp-quente)",
};

export function TermometroBadge({ value }: { value: Termometro }) {
  const { label, icon } = TERMOMETRO_CONFIG[value];
  return (
    <Badge variant={value} className="gap-1 pl-2">
      <Icon name={icon} size={12} />
      {label}
    </Badge>
  );
}
