export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTon(nanoton: number | string): string {
  const val = Number(nanoton) / 1e9;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K TON`;
  if (val >= 1) return `${val.toFixed(2)} TON`;
  return `${val.toFixed(4)} TON`;
}

export function formatNanoton(nanoton: number | string): string {
  return formatTon(nanoton);
}

export function formatBps(bps: number): string {
  const pct = bps / 100;
  return pct < 1 ? `${pct.toFixed(2)}%` : `${pct.toFixed(0)}%`;
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}
