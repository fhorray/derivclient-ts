/**
 * Exponential Moving Average (EMA)
 * @param data Array of numbers
 * @param period Lookback period
 * @returns Array of EMA values
 */
export function EMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length).fill(null);

  if (data.length < period) return result;

  const multiplier = 2 / (period + 1);

  // Start with SMA for the first valid point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }

  let ema = sum / period;
  result[period - 1] = ema;

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result[i] = ema;
  }

  return result;
}
