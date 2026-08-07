import { Icon } from "@/components/ui/Icon";

export interface CardIconProps {
  name: string;
  color: string;
}

export function CardIcon({ name, color }: CardIconProps) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      <Icon name={name} size={22} />
    </div>
  );
}
