// Chain types
export interface Chain {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl: string;
  icon: string;
  testnet: boolean;
}

// Token types
export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  isNative?: boolean;
}

// Pool types
export interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  tvl: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  userLiquidity?: string;
}

// Trade/Swap types
export interface Trade {
  inputAmount: string;
  outputAmount: string;
  inputToken: Token;
  outputToken: Token;
  price: number;
  priceImpact: number;
  route: string[];
  minimumReceived: string;
  liquidityProviderFee: string;
}

// Transaction types
export type TransactionStatus = 'pending' | 'success' | 'error';

export interface Transaction {
  id: string;
  hash: string;
  status: TransactionStatus;
  type: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'approve';
  description: string;
  timestamp: number;
  chainId: number;
  from: string;
}

// Wallet types
export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: any | null;
}

// Price/Chart types
export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface ChartData {
  pair: string;
  timeframe: string;
  data: PricePoint[];
}

// Liquidity position
export interface LiquidityPosition {
  poolId: string;
  token0: Token;
  token1: Token;
  amount0: string;
  amount1: string;
  lpTokens: string;
  share: number;
  valueUSD: number;
}

// Settings
export interface SwapSettings {
  slippageTolerance: number;
  deadline: number;
  infiniteApprove: boolean;
  expertMode: boolean;
}
