/** Display purchase amounts in common currencies (e.g. ETB from minor units if stored as whole birr, adjust when Chapa is wired). */
export function formatMoneyAmount(
  amountCents: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amountCents == null || !currency) return "—";
  const cur = currency.toUpperCase();
  const n = amountCents / 100;
  if (cur === "ETB" || cur === "USD" || cur === "EUR") {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(n);
    } catch {
      return `${n.toFixed(2)} ${cur}`;
    }
  }
  return `${n.toFixed(2)} ${cur}`;
}
