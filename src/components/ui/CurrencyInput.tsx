"use client";

import { forwardRef, type ChangeEvent } from "react";
import { Input, type InputProps } from "./Input";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export interface CurrencyInputProps extends Omit<InputProps, "value" | "onChange" | "type"> {
  value: number | null;
  onChange: (value: number | null) => void;
}

// Máscara "de trás pra frente": os dígitos digitados são tratados como
// centavos, então o valor formatado (R$ 1.234,56) sempre bate com o número
// controlado — sem estado local pra sincronizar.
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const display = value != null ? currencyFormatter.format(value) : "";

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      const digits = event.target.value.replace(/\D/g, "");
      onChange(digits ? Number(digits) / 100 : null);
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
