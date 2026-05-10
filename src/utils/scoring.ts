export function calculatePoints(done: number, total: number): number {
  if (total === 0) return 0;
  const pct = (done / total) * 100;
  if (pct >= 90) return 3;
  if (pct >= 60) return 2;
  if (pct >= 30) return 1;
  if (pct >= 1)  return 0;
  return -1;
}
