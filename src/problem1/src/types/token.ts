export interface Token {
  symbol: string;
  name: string;
  price: number;
  date: string;
  decimals: number;
  iconUrl?: string;
  color?: string;
}

export interface RawPriceItem {
  currency: string;
  date: string;
  price: number;
}

export interface UserBalance {
  [symbol: string]: number;
}

export type SlippageOption = 0.1 | 0.5 | 1.0 | 'custom';

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  rate: number;
  inverseRate: number;
  priceImpact: number;
  minimumReceived: number;
  estimatedGasUsd: number;
  slippageTolerance: number;
  route: string[];
}

export interface Transaction {
  id: string;
  hash: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  fromUsd: number;
  toUsd: number;
  rate: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export type SwapExecutionStep = 'idle' | 'review' | 'approving' | 'swapping' | 'success' | 'error';
