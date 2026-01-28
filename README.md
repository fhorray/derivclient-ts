# Deriv API Client

A standalone, high-performance Deriv API client for authorized operations, subscriptions, and technical analysis.

## Features

- **Keep-Alive**: Built-in heartbeat (ping) every 30 seconds for stable connections.
- **Modern Imports**: Support for sub-path exports for technical indicators.
- **Core Operations**: Comprehensive support for Buy, Sell, Balance, and Active Symbols.
- **Historical Data**: Seamless fetching of Ticks and Candles history.
- **Technical Indicators**: Built-in mathematical indicators (BB, MACD, SMA, EMA).
- **Advanced Proposals**: Support for single and stream proposals (including Accumulators).
- **Real-time Subscriptions**: Ticks, Proposals, and Open Contracts.

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Core Client

```typescript
import { DerivServiceClient } from 'derivclient-ts';

const deriv = new DerivServiceClient({
  appId: YOUR_APP_ID,
  token: 'YOUR_TOKEN',
});

async function start() {
  await deriv.initialize();

  // Get history
  const history = await deriv.getTicksHistory('R_100', { count: 10 });
  console.log('Last ticks:', history.history?.prices);

  // Subscribe to ticks
  await deriv.subscribeTicks('R_100', (tick) => {
    console.log(`New Tick: ${tick.quote}`);
  });
}
```

### Technical Indicators

The library provides a specialized sub-path for indicators to keep your bundle light.

```typescript
import { BollingerBands, MACD } from 'derivclient-ts/indicators';

const prices = [100, 101, 102, 101, 103, 105, 104, 106]; // ...

// Bollinger Bands (period, stdDev)
const { upper, middle, lower } = BollingerBands(prices, 20, 2);

// MACD (fast, slow, signal)
const { macd, signal, histogram } = MACD(prices, 12, 26, 9);
```

### Accumulators

Accumulators allow you to profit as long as the market stays within a range.

```typescript
// 1. Get a proposal for Accumulator
const proposal = await deriv.getProposal({
  symbol: 'R_100',
  contract_type: 'ACCU',
  amount: 10,
  basis: 'stake',
  growth_rate: 0.03, // 3%
});

const proposalId = proposal.proposal.id;
console.log('Current spot:', proposal.proposal.spot);

// 2. Buy the contract
const buy = await deriv.buyContract({
  buy: proposalId,
  price: 10,
});

const contractId = buy.buy.contract_id;

// 3. Track the contract (ticks_stayed_in)
await deriv.subscribeOpenContract(contractId, (poc) => {
  console.log(`Ticks Stayed In: ${poc.tick_count}`);
  console.log(`Current Profit: ${poc.profit}`);

  if (poc.is_sold) {
    // 4. Identify the result
    if (poc.status === 'won') {
      console.log(`🏆 Win! Profit: ${poc.profit}`);
    } else if (poc.status === 'lost') {
      console.log(`❌ Loss. Amount: ${poc.profit}`);
    }
    console.log('Contract ended');
  }
});
```

### Identifying Results (Win/Loss)

When a contract is completed (`is_sold`), you can use the following fields:

- **`status`**: `'won'` or `'lost'`.
- **`profit`**: The final profit or loss amount.
- **`exit_tick`**: The price where the contract ended.

```typescript
if (poc.is_sold) {
  const isWin = poc.status === 'won';
  const finalProfit = poc.profit;
}
```

## API Reference

### Core Client

| Method                                   | Description                           |
| ---------------------------------------- | ------------------------------------- |
| `initialize()`                           | Authenticates the connection.         |
| `getBalance()`                           | Returns the current account balance.  |
| `getTicksHistory(symbol, options)`       | Returns historical ticks.             |
| `getCandles(symbol, granularity, count)` | Returns historical candles.           |
| `getProposal(config)`                    | Returns a single price proposal.      |
| `subscribeTicks(symbol, callback)`       | Subscribes to real-time tick updates. |
| `buyContract(parameters)`                | Executes a buy operation.             |
| `sellContract(contractId)`               | Executes a sell operation.            |
| `disconnect()`                           | Terminates the WebSocket connection.  |

### Indicators (`/indicators`)

- **BollingerBands**: `(data, period?, stdDev?)`
- **MACD**: `(data, fast?, slow?, signal?)`
- **SMA/EMA**: `(data, period)`
- **StdDev**: `(data, period)`

## Troubleshooting

### "Cannot find module" or Type Declaration errors

If you encounter errors like `Cannot find module 'derivclient-ts/indicators'`, ensure that your `tsconfig.json` has the following settings:

```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler", // or "NodeNext" / "Node16"
    "module": "ESNext" // or "NodeNext"
  }
}
```

Modern TypeScript requires `moduleResolution` set to `Bundler`, `Node16`, or `NodeNext` to properly support the `exports` field in `package.json`.
