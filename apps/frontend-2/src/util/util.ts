export function calculatePercentage(divident: number, divisor: number) {
  return Math.round((divident / (divisor || 1)) * 100);
}
