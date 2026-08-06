import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={cn(
            "h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
            "disabled:pointer-events-none disabled:opacity-50",
            error && "border-temp-quente focus-visible:ring-temp-quente",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-sm text-temp-quente">{error}</span>}
      </div>
    );
  },
);
Select.displayName = "Select";
