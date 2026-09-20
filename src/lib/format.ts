import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

let DEFAULT_CURRENCY = "USD";

/** Set the workspace default currency used whenever a caller does not pass one. */
export function setDefaultCurrency(currency: string) {
  if (currency) DEFAULT_CURRENCY = currency;
}

export function getDefaultCurrency(): string {
  return DEFAULT_CURRENCY;
}

export function money(value: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
}

export function percent(value: number): string {
  return `${Math.round(value)}%`;
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function fmtDate(value: string | Date | null | undefined, pattern = "dd MMM yyyy"): string {
  if (!value) return "—";
  const d = toDate(value);
  return isValid(d) ? format(d, pattern) : "—";
}

export function fmtDateTime(value: string | Date | null | undefined): string {
  return fmtDate(value, "dd MMM yyyy, HH:mm");
}

export function fromNow(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = toDate(value);
  return isValid(d) ? `${formatDistanceToNowStrict(d)} ago` : "—";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function lineItemsTotal(
  items: { quantity: number; rate: number }[],
  discount = 0,
  taxRate = 0,
): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = (taxable * taxRate) / 100;
  return { subtotal, tax, total: taxable + tax };
}
