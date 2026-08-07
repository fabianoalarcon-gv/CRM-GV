import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={!!error}
          className={cn(
            "resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-brand-graphite-light",
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
Textarea.displayName = "Textarea";
