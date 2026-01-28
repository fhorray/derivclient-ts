import WebSocket from 'ws';
// @ts-ignore
import DerivAPI from '@deriv/deriv-api/dist/DerivAPI';
import {
  DerivConfig,
  IDerivServiceClient,
  BalanceResponse,
  TickData,
  TicksHistoryRequest,
  TicksHistoryResponse,
  ProposalRequest,
  ProposalResponse
} from './types';

export class DerivServiceClient implements IDerivServiceClient {
  public api: any;
  public connection: WebSocket;
  private token: string;
  private appId: number;
  private endpoint: string;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(config: DerivConfig) {
    this.appId = config.appId;
    this.token = config.token;
    this.endpoint = config.endpoint || 'ws.derivws.com';

    this.connection = new WebSocket(`wss://${this.endpoint}/websockets/v3?app_id=${this.appId}`);
    this.api = new DerivAPI({ connection: this.connection });

    this.setupHeartbeat();
  }

  private setupHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.connection.readyState === WebSocket.OPEN) {
        this.connection.send(JSON.stringify({ ping: 1 }));
      }
    }, 30000);

    this.connection.on('close', () => {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    });

    this.connection.on('error', (error) => {
      console.error('[DerivClient] Connection error:', error);
    });
  }

  async initialize(): Promise<void> {
    try {
      // @ts-ignore
      await this.api.basic.authorize({ authorize: this.token });
      console.log('[DerivClient] Authorized successfully');
    } catch (error) {
      console.error('[DerivClient] Authorization failed:', error);
      throw error;
    }
  }

  async getBalance(): Promise<BalanceResponse> {
    try {
      // @ts-ignore
      const response = await this.api.basic.balance();
      return {
        currency: response.balance.currency,
        balance: Number(response.balance.balance),
        loginid: response.balance.loginid
      };
    } catch (error) {
      throw error;
    }
  }

  private tickListener: ((data: any) => void) | null = null;

  async subscribeTicks(symbol: string, callback: (tick: TickData) => void): Promise<any> {
    try {
      if (this.tickListener) {
        this.connection.removeListener('message', this.tickListener);
        this.tickListener = null;
      }

      // @ts-ignore
      const response = await this.api.basic.ticks(symbol, { subscribe: 1 });

      this.tickListener = (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.msg_type === 'tick' && msg.tick && msg.tick.symbol === symbol) {
            callback(msg.tick as TickData);
          }
        } catch (e) { }
      };

      this.connection.on('message', this.tickListener);
      return response;
    } catch (error: any) {
      if (error.error?.code === 'AlreadySubscribed' || error.message?.includes('already subscribed')) {
        return { subscription: { id: 'existing' } };
      }
      throw error;
    }
  }

  async unsubscribeAllTicks(): Promise<void> {
    try {
      if (this.tickListener) {
        this.connection.removeListener('message', this.tickListener);
        this.tickListener = null;
      }
      // @ts-ignore
      await this.api.basic.forgetAll({ forget_all: 'ticks' });
    } catch (e) { }
  }

  async getTicksHistory(symbol: string, options: Partial<TicksHistoryRequest> = {}): Promise<TicksHistoryResponse> {
    try {
      // @ts-ignore
      return await this.api.basic.ticksHistory({
        ticks_history: symbol,
        style: 'ticks',
        end: 'latest',
        count: 100,
        ...options
      });
    } catch (error) {
      throw error;
    }
  }

  async getCandles(symbol: string, granularity: number, count: number = 100): Promise<any> {
    try {
      // @ts-ignore
      return await this.api.basic.ticksHistory({
        ticks_history: symbol,
        style: 'candles',
        granularity,
        count,
        end: 'latest'
      });
    } catch (error) {
      throw error;
    }
  }

  async buyContract(parameters: any): Promise<any> {
    try {
      // @ts-ignore
      const response = await this.api.basic.buy(parameters);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async sellContract(contractId: number): Promise<any> {
    try {
      // @ts-ignore
      const response = await this.api.basic.sell({ sell: contractId, price: 0 });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getActiveSymbols(product_type: string = 'basic'): Promise<any[]> {
    try {
      // @ts-ignore
      const response = await this.api.basic.activeSymbols({
        active_symbols: 'brief',
        product_type: product_type
      });
      return response.active_symbols || [];
    } catch (error) {
      return [];
    }
  }

  async getProposal(config: ProposalRequest): Promise<ProposalResponse> {
    try {
      const { subscribe, ...params } = config;
      // @ts-ignore
      return await this.api.basic.proposal({
        ...params
      });
    } catch (error) {
      throw error;
    }
  }

  async subscribeProposal(config: ProposalRequest): Promise<any> {
    try {
      // @ts-ignore
      const response = await this.api.basic.proposal({
        ...config,
        subscribe: 1
      });
      return response;
    } catch (error: any) {
      if (error.error?.code === 'AlreadySubscribed' || error.message?.includes('already subscribed')) {
        return { subscription: { id: 'existing' } };
      }
      throw error;
    }
  }

  async subscribeOpenContract(contractId: number, callback: (poc: any) => void): Promise<void> {
    try {
      // @ts-ignore
      const response = await this.api.basic.proposalOpenContract({
        contract_id: contractId,
        subscribe: 1
      });

      const subscriptionId = response.subscription?.id;

      const messageHandler = (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.msg_type === 'proposal_open_contract') {
            const poc = msg.proposal_open_contract;
            if (poc && poc.contract_id == contractId) {
              callback(poc);
              if (poc.is_sold) {
                this.connection.removeListener('message', messageHandler);
                if (subscriptionId) {
                  this.api.basic.forget({ forget: subscriptionId }).catch(() => { });
                }
              }
            }
          }
        } catch (e) { }
      };

      this.connection.on('message', messageHandler);
    } catch (error) {
      throw error;
    }
  }

  async getContractStatus(contractId: number): Promise<any> {
    try {
      // @ts-ignore
      const response = await this.api.basic.proposalOpenContract({
        contract_id: contractId
      });
      return response.proposal_open_contract;
    } catch (error) {
      throw error;
    }
  }

  async getContractUpdateHistory(contractId: number): Promise<any> {
    try {
      // @ts-ignore
      return await this.api.basic.contractUpdateHistory({
        contract_id: contractId
      });
    } catch (error) {
      throw error;
    }
  }

  async getAccountStatus(): Promise<any> {
    try {
      // @ts-ignore
      return await this.api.basic.getAccountStatus();
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.connection) {
      this.connection.terminate();
    }
  }
}
