/**
 * Utility functions for parsing and formatting Brazilian Real (BRL) currency values.
 */

/**
 * Parses a locale-formatted monetary string into cents (integer).
 * Handles R$, thousand separators, and comma/dot decimal separators.
 * 
 * Examples:
 *   "R$ 1.984,23" → 198423
 *   "1984,23"     → 198423
 *   "1984.23"     → 198423
 *   "0,50"        → 50
 */
export function parseAmountInCents(value: string): number {
  if (!value || value.trim() === "") return 0;

  let str = String(value).trim();

  // Remove currency symbols and whitespace
  str = str.replace(/[R$€£¥¤\s]/g, "");

  // Detect locale by examining separator positions
  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");

  const isCommaDecimal = lastComma > lastDot;

  if (isCommaDecimal) {
    str = str.replace(/\./g, ""); // Remove thousand separators (dots)
    str = str.replace(",", "."); // Convert decimal comma to dot
  } else {
    str = str.replace(/,/g, ""); // Remove thousand separators (commas)
  }

  const parsedFloat = parseFloat(str);
  return isNaN(parsedFloat) ? 0 : Math.round(parsedFloat * 100);
}

/**
 * Converts cents to reais (float).
 */
export function centsToReais(cents: number): number {
  return cents / 100;
}

/**
 * Parses a user-input string to a float amount in reais.
 * Uses parseAmountInCents internally for robust locale handling.
 */
export function parseAmountToReais(value: string): number {
  return centsToReais(parseAmountInCents(value));
}
