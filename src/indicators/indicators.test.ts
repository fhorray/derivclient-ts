import { expect, test, describe } from "bun:test";
import { SMA, EMA, StdDev, BollingerBands, MACD } from "./index";

describe("Technical Indicators", () => {
  const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];

  test("SMA calculation", () => {
    const period = 5;
    const result = SMA(data, period);

    // First 4 should be null
    expect(result.slice(0, 4)).toEqual([null, null, null, null]);
    // Fifth should be (10+12+14+16+18)/5 = 14
    expect(result[4]).toBe(14);
    // Sixth should be (12+14+16+18+20)/5 = 16
    expect(result[5]).toBe(16);
  });

  test("EMA calculation", () => {
    const period = 5;
    const result = EMA(data, period);

    expect(result[0]).toBe(null);
    expect(result[4]).toBe(14); // Initial EMA is usually SMA
    // multiplier = 2 / (5 + 1) = 0.3333
    // EMA[5] = (data[5] - EMA[4]) * 0.3333 + EMA[4]
    // EMA[5] = (20 - 14) * 0.3333 + 14 = 2 + 14 = 16
    expect(result[5]).toBeCloseTo(16, 2);
  });

  test("Bollinger Bands calculation", () => {
    const period = 5;
    const { upper, lower, middle } = BollingerBands(data, period, 2);

    expect(middle[4]).toBe(14);
    // For [10, 12, 14, 16, 18], mean=14
    // Variance = ((10-14)^2 + (12-14)^2 + (14-14)^2 + (16-14)^2 + (18-14)^2) / 5
    // Variance = (16 + 4 + 0 + 4 + 16) / 5 = 40 / 5 = 8
    // StdDev = sqrt(8) approx 2.8284
    // Upper = 14 + 2 * 2.8284 = 19.6568
    // Lower = 14 - 2 * 2.8284 = 8.3432
    expect(upper[4]).toBeCloseTo(14 + 2 * Math.sqrt(8), 4);
    expect(lower[4]).toBeCloseTo(14 - 2 * Math.sqrt(8), 4);
  });

  test("MACD calculation", () => {
    const macdData = new Array(50).fill(0).map((_, i) => i + 10);
    const { macd, signal, histogram } = MACD(macdData, 12, 26, 9);

    // MACD becomes valid at max(12, 26) - 1 = 25
    expect(macd[24]).toBe(null);
    expect(macd[25]).not.toBe(null);

    // Signal becomes valid at 25 + 9 - 1 = 33
    expect(signal[32]).toBe(null);
    expect(signal[33]).not.toBe(null);

    if (macd[33] !== null && signal[33] !== null) {
      expect(histogram[33]).toBe(macd[33]! - signal[33]!);
    }
  });

  test("StdDev calculation", () => {
    const sample = [2, 4, 4, 4, 5, 5, 7, 9];
    const period = 8;
    const result = StdDev(sample, period);

    // mean = (2+4+4+4+5+5+7+9)/8 = 40/8 = 5
    // variance = ((2-5)^2 + (4-5)^2*3 + (5-5)^2*2 + (7-5)^2 + (9-5)^2) / 8
    // variance = (9 + 1*3 + 0 + 4 + 16) / 8 = 32 / 8 = 4
    // stddev = sqrt(4) = 2
    expect(result[7]).toBe(2);
  });
});
