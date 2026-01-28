/**
 * Standard Deviation
 * @param data Array of numbers
 * @param period Lookback period
 * @returns Array of Standard Deviation values
 */
export function StdDev(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length).fill(null);

  if (data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    result[i] = Math.sqrt(variance);
  }

  return result;
}
