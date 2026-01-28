import { EMA } from './ema';

export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

/**
 * Moving Average Convergence Divergence (MACD)
 * @param data Array of numbers
 * @param fastPeriod (default: 12)
 * @param slowPeriod (default: 26)
 * @param signalPeriod (default: 9)
 */
export function MACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = EMA(data, fastPeriod);
  const slowEMA = EMA(data, slowPeriod);

  const macd: (number | null)[] = new Array(data.length).fill(null);

  for (let i = 0; i < data.length; i++) {
    const fast = fastEMA[i];
    const slow = slowEMA[i];

    if (fast !== null && slow !== null) {
      macd[i] = fast - slow;
    }
  }

  // Filter out the nulls from the beginning of MACD to calculate signal EMA
  const macdValues = macd.map(v => v === null ? 0 : v);
  const signal = EMA(macdValues, signalPeriod);

  // Recalculate nulls for signal where MACD was null
  const firstValidMacd = Math.max(fastPeriod, slowPeriod) - 1;
  const firstValidSignal = firstValidMacd + signalPeriod - 1;

  for (let i = 0; i < signal.length; i++) {
    if (i < firstValidSignal) {
      signal[i] = null;
    }
  }

  const histogram: (number | null)[] = new Array(data.length).fill(null);
  for (let i = 0; i < data.length; i++) {
    const m = macd[i];
    const s = signal[i];
    if (m !== null && s !== null) {
      histogram[i] = m - s;
    }
  }

  return { macd, signal, histogram };
}
