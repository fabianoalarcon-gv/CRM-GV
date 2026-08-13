import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import type { Termometro } from "../types";

const TERMOMETRO_CONFIG: Record<Termometro, { label: string; icon: string }> = {
  frio: { label: "Frio", icon: "ac_unit" },
  morno: { label: "Morno", icon: "wb_sunny" },
  quente: { label: "Quente", icon: "local_fire_department" },
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
