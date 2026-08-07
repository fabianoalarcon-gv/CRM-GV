import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, icon, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-brand-graphite-light">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-brand-graphite-light",
              icon ? "pl-10 pr-3" : "px-3",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
              "disabled:pointer-events-none disabled:opacity-50",
              error && "border-temp-quente focus-visible:ring-temp-quente",
              className,
            )}
            {...props}
          />
        </div>
        {error && <span className="text-sm text-temp-quente">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
