/** Format minor units for public revenue display (safe for client + server). */
export function formatPublicRevenue(
  totalCents: number,
  currencyHint: string = "usd",
): string {
  if (totalCents <= 0) return "$0";
  const cur = currencyHint.toLowerCase();
  const major = totalCents / 100;
  if (cur === "etb" || cur === "birr") {
    return `ETB ${major.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: cur === "usd" ? "USD" : cur.toUpperCase(),
    maximumFractionDigits: major >= 1000 ? 0 : 2,
  }).format(major);
}
