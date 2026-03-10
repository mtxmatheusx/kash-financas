import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Formats a raw numeric string (digits + optional comma) into BRL display: 1.984,23
 * Operates on cents internally for precision.
 */
function formatBRL(raw: string): string {
  // Keep only digits
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Pad to at least 3 digits so we always have decimal part
  const padded = digits.padStart(3, "0");
  const intPart = padded.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const decPart = padded.slice(-2);

  // Add thousand separators
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${withSep},${decPart}`;
}

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onValueChange: (formatted: string, cents: number) => void;
  className?: string;
}

/**
 * Masked BRL currency input.
 * - `value`: the formatted display string (e.g. "1.984,23")
 * - `onValueChange(formatted, cents)`: called on every keystroke
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onValueChange,
  className,
  ...rest
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      if (!raw) {
        onValueChange("", 0);
        return;
      }
      const formatted = formatBRL(raw);
      const cents = parseInt(raw, 10);
      onValueChange(formatted, cents);
    },
    [onValueChange]
  );

  return (
    <Input
      {...rest}
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      className={cn(className)}
      placeholder="0,00"
    />
  );
};

export default CurrencyInput;
