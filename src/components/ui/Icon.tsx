import { cn } from "@/lib/cn";

export interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 20 }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined select-none", className)}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
