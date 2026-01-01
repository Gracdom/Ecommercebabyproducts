export function* chunk<T>(arr: T[], size = 500): Generator<T[]> {
  const safeSize = Math.max(1, Math.floor(size));
  for (let i = 0; i < arr.length; i += safeSize) {
    yield arr.slice(i, i + safeSize);
  }
}

export function parseBigBuyDateTime(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;

  // BigBuy often uses "YYYY-MM-DD HH:mm:ss"
  const isoLike = s.includes("T") ? s : s.replace(" ", "T");
  const withZ = isoLike.endsWith("Z") ? isoLike : `${isoLike}Z`;
  const d = new Date(withZ);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function computeSalePriceEurX95(wholesalePrice: number): number {
  if (!Number.isFinite(wholesalePrice) || wholesalePrice <= 0) return 0;
  const base = wholesalePrice * 1.2;
  const floor = Math.floor(base);
  let p = floor + 0.95;
  if (p < base) p = floor + 1 + 0.95;
  return Math.round(p * 100) / 100;
}

export function sumStockFromByHandlingDays(record: any): number {
  const stocks = Array.isArray(record?.stocks) ? record.stocks : [];
  if (!stocks.length) {
    const direct = record?.stock ?? record?.quantity ?? record?.available ?? record?.value;
    const n = Number(direct);
    return Number.isFinite(n) ? n : 0;
  }
  let total = 0;
  for (const s of stocks) {
    const n = Number(s?.quantity ?? s?.stock ?? s?.available ?? s?.value ?? 0);
    if (Number.isFinite(n)) total += n;
  }
  return total;
}


