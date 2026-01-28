import { BollingerBands, MACD, SMA, EMA } from './indicators';

const demoData = [
  100, 102, 101, 103, 105, 104, 106, 108, 107, 109,
  111, 110, 112, 114, 113, 115, 117, 116, 118, 120,
  122, 121, 123, 125, 124, 126, 128, 127, 129, 131
];

console.log('--- SMA (5) ---');
const sma5 = SMA(demoData, 5);
console.log(sma5.slice(-5));

console.log('--- EMA (5) ---');
const ema5 = EMA(demoData, 5);
console.log(ema5.slice(-5));

console.log('--- Bollinger Bands (20, 2) ---');
const bb = BollingerBands(demoData, 20, 2);
console.log('Upper:', bb.upper.slice(-1));
console.log('Middle:', bb.middle.slice(-1));
console.log('Lower:', bb.lower.slice(-1));

console.log('--- MACD (12, 26, 9) ---');
const macd = MACD(demoData);
console.log('MACD:', macd.macd.slice(-1));
console.log('Signal:', macd.signal.slice(-1));
console.log('Histogram:', macd.histogram.slice(-1));
