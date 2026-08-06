import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            "h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-brand-graphite-light",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
            "disabled:pointer-events-none disabled:opacity-50",
            error && "border-temp-quente focus-visible:ring-temp-quente",
            className,
          )}
          {...props}
        />
        {error && <span className="text-sm text-temp-quente">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
