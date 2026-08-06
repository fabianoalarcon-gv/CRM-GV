import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  "default" | "success" | "warning" | "danger" | "info" | "frio" | "morno" | "quente";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-brand-graphite/10 text-brand-graphite dark:text-brand-graphite-light",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "bg-temp-morno/15 text-yellow-700 dark:text-temp-morno",
  danger: "bg-temp-quente/10 text-temp-quente",
  info: "bg-temp-frio/10 text-sky-600 dark:text-temp-frio",
  // Etiquetas de Termômetro do Pipeline Comercial (PIPE-07)
  frio: "bg-temp-frio/15 text-sky-700 dark:text-temp-frio",
  morno: "bg-temp-morno/20 text-yellow-800 dark:text-temp-morno",
  quente: "bg-temp-quente/15 text-temp-quente",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
