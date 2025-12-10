export function calculatePercentage(divident: number, divisor: number) {
  return Math.round((divident / (divisor || 1)) * 100);
}

export function isDecember() {
  return new Date().getMonth() === 11;
}
