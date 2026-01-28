# Deriv API Client

A standalone, basic Deriv API client for connection, authorized operations, and subscriptions.

## Features

- **Keep-Alive**: Built-in heartbeat (ping) every 30 seconds.
- **Easy Instance**: Just provide `appId` and `token`.
- **Core Operations**: Buy, Sell, Balance, Active Symbols.
- **Historical Data**: Fetch Ticks and Candles history.
- **Advanced Proposals**: Single and stream proposals (includes `ticks_stayed_in` for accumulators).
- **Subscriptions**: Real-time Ticks, Proposals, and Open Contracts.

## Installation

```bash
# Inside the root of your project
cd deriv
npm install
npm run build
```

## Usage

```typescript
import { DerivServiceClient } from './deriv/src';

const deriv = new DerivServiceClient({
  appId: YOUR_APP_ID,
  token: 'YOUR_TOKEN'
});

async function start() {
  await deriv.initialize();
  
  // Get history
  const history = await deriv.getTicksHistory('R_100', { count: 10 });
  console.log('Last ticks:', history.history?.prices);

  // Single Proposal (Useful for checking accumulators_stats / ticks_stayed_in)
  const proposal = await deriv.getProposal({
    symbol: 'R_100',
    contract_type: 'ACCU',
    amount: 10,
    basis: 'stake',
    growth_rate: 0.03
  });
  console.log('Stayed in:', proposal.proposal?.contract_details?.ticks_stayed_in);

  // Subscribe to ticks
  await deriv.subscribeTicks('R_100', (tick) => {
    console.log(`New Tick: ${tick.quote}`);
  });
}

start();
```

## API Reference

### `initialize()`
Authenticates the connection with the provided token.

### `getBalance()`
Returns the current account balance.

### `getTicksHistory(symbol, options)`
Returns historical ticks for a symbol.

### `getCandles(symbol, granularity, count)`
Returns historical candles for a symbol.

### `getProposal(config)`
Returns a single price proposal for a contract (non-subscription).

### `subscribeTicks(symbol, callback)`
Subscribes to real-time tick updates for a symbol.

### `buyContract(parameters)`
Executes a buy operation.

### `sellContract(contractId)`
Executes a sell operation.

### `getAccountStatus()`
Returns the status of the authorized account.

### `disconnect()`
Terminates the WebSocket connection and clears intervals.
