export interface DerivConfig {
  appId: number;
  token: string;
  endpoint?: string;
}

export interface BalanceResponse {
  currency: string;
  balance: number;
  loginid: string;
}

export interface TickData {
  quote: number;
  epoch: number;
  symbol: string;
  pip_size?: number;
  [key: string]: any;
}

export interface TicksHistoryRequest {
  ticks_history: string;
  adjust_start_time?: number;
  count?: number;
  end?: string | number;
  granularity?: number;
  start?: number;
  style?: 'ticks' | 'candles';
  subscribe?: number;
  [key: string]: any;
}

export interface TicksHistoryResponse {
  history?: {
    prices: number[];
    times: number[];
  };
  candles?: any[];
  [key: string]: any;
}

export interface ProposalRequest {
  proposal?: number;
  amount?: number;
  barrier?: string;
  barrier2?: string;
  basis?: 'stake' | 'payout';
  contract_type: string;
  currency?: string;
  duration?: number;
  duration_unit?: 's' | 'm' | 'h' | 'd' | 't';
  symbol: string;
  subscribe?: number;
  [key: string]: any;
}

export interface ProposalResponse {
  proposal?: {
    ask_price: number;
    id: string;
    payout: number;
    spot: number;
    spot_time: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface IDerivServiceClient {
  initialize(): Promise<void>;
  getBalance(): Promise<BalanceResponse>;
  subscribeTicks(symbol: string, callback: (tick: TickData) => void): Promise<any>;
  unsubscribeAllTicks(): Promise<void>;
  getTicksHistory(symbol: string, options?: Partial<TicksHistoryRequest>): Promise<TicksHistoryResponse>;
  getCandles(symbol: string, granularity: number, count?: number): Promise<any>;
  buyContract(parameters: any): Promise<any>;
  sellContract(contractId: number): Promise<any>;
  getActiveSymbols(product_type?: string): Promise<any[]>;
  getProposal(config: ProposalRequest): Promise<ProposalResponse>;
  subscribeProposal(config: ProposalRequest): Promise<any>;
  subscribeOpenContract(contractId: number, callback: (poc: any) => void): Promise<void>;
  getContractStatus(contractId: number): Promise<any>;
  getContractUpdateHistory(contractId: number): Promise<any>;
  getAccountStatus(): Promise<any>;
  disconnect(): Promise<void>;
}
