import { SMA } from './sma';
import { StdDev } from './stddev';

export interface BBResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

/**
 * Bollinger Bands (BB)
 * @param data Array of numbers
 * @param period Lookback period (default: 20)
 * @param stdDevProp Standard Deviation multiplier (default: 2)
 * @returns Object with upper, middle, and lower bands
 */
export function BollingerBands(data: number[], period: number = 20, stdDevProp: number = 2): BBResult {
  const middle = SMA(data, period);
  const stdDev = StdDev(data, period);

  const upper: (number | null)[] = new Array(data.length).fill(null);
  const lower: (number | null)[] = new Array(data.length).fill(null);

  for (let i = 0; i < data.length; i++) {
    const mid = middle[i];
    const dev = stdDev[i];

    if (mid !== null && dev !== null) {
      upper[i] = mid + (stdDevProp * dev);
      lower[i] = mid - (stdDevProp * dev);
    }
  }

  return { upper, middle, lower };
}
