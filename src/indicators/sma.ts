/**
 * Simple Moving Average (SMA)
 * @param data Array of numbers
 * @param period Lookback period
 * @returns Array of SMA values (same length as data, with nulls for leading values)
 */
export function SMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length).fill(null);
  
  if (data.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  
  result[period - 1] = sum / period;

  for (let i = period; i < data.length; i++) {
    sum = sum - data[i - period] + data[i];
    result[i] = sum / period;
  }

  return result;
}
