import { UserBalance } from '../types/token';

export const TOKEN_METADATA: Record<string, { name: string; decimals: number; color: string }> = {
  ETH: { name: 'Ethereum', decimals: 18, color: '#627EEA' },
  WBTC: { name: 'Wrapped Bitcoin', decimals: 8, color: '#F7931A' },
  wstETH: { name: 'Wrapped Staked ETH', decimals: 18, color: '#00A3FF' },
  USDC: { name: 'USD Coin', decimals: 6, color: '#2775CA' },
  axlUSDC: { name: 'Axelar USD Coin', decimals: 6, color: '#2563EB' },
  BUSD: { name: 'Binance USD', decimals: 18, color: '#F0B90B' },
  USD: { name: 'US Dollar', decimals: 2, color: '#10B981' },
  USC: { name: 'Carbon USD', decimals: 6, color: '#14B8A6' },
  YieldUSD: { name: 'Yield USD', decimals: 6, color: '#8B5CF6' },
  SWTH: { name: 'Switcheo', decimals: 8, color: '#13C2C2' },
  rSWTH: { name: 'Reward SWTH', decimals: 8, color: '#06B6D4' },
  ATOM: { name: 'Cosmos Hub', decimals: 6, color: '#2E3148' },
  STATOM: { name: 'Stride Staked ATOM', decimals: 6, color: '#E11D48' },
  RATOM: { name: 'StaFi Staked ATOM', decimals: 6, color: '#F43F5E' },
  OSMO: { name: 'Osmosis', decimals: 6, color: '#760D89' },
  STOSMO: { name: 'Stride Staked OSMO', decimals: 6, color: '#9333EA' },
  LUNA: { name: 'Terra Luna', decimals: 6, color: '#FFD83D' },
  STLUNA: { name: 'Stride Staked LUNA', decimals: 6, color: '#F59E0B' },
  ampLUNA: { name: 'Amplified LUNA', decimals: 6, color: '#D97706' },
  GMX: { name: 'GMX', decimals: 18, color: '#2D42FC' },
  OKB: { name: 'OKB Token', decimals: 18, color: '#3075FF' },
  OKT: { name: 'OKT Chain', decimals: 18, color: '#3B82F6' },
  KUJI: { name: 'Kujira', decimals: 6, color: '#EF4444' },
  STRD: { name: 'Stride', decimals: 6, color: '#E11D48' },
  EVMOS: { name: 'Evmos', decimals: 18, color: '#EA580C' },
  STEVMOS: { name: 'Stride Staked Evmos', decimals: 18, color: '#FB923C' },
  IBCX: { name: 'ION DAO IBCX', decimals: 6, color: '#6366F1' },
  IRIS: { name: 'IRIS Network', decimals: 6, color: '#A855F7' },
  BLUR: { name: 'Blur', decimals: 18, color: '#FF6B00' },
  bNEO: { name: 'Burgerswap NEO', decimals: 8, color: '#00E599' },
  LSI: { name: 'Liquid Staking Index', decimals: 18, color: '#0284C7' },
  ZIL: { name: 'Zilliqa', decimals: 12, color: '#29CCC4' },
};

export const INITIAL_USER_BALANCES: UserBalance = {
  ETH: 4.852,
  WBTC: 0.354,
  USDC: 12500.0,
  BUSD: 3400.0,
  SWTH: 154000.0,
  ATOM: 240.5,
  OSMO: 1200.0,
  GMX: 18.5,
  BLUR: 4500.0,
  LUNA: 1850.0,
  OKB: 65.0,
  wstETH: 2.1,
  STRD: 800.0,
  KUJI: 950.0,
};

export const POPULAR_TOKENS = ['ETH', 'WBTC', 'USDC', 'SWTH', 'ATOM', 'OSMO', 'GMX'];

export const BASE_TOKEN_ICON_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';
export const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';
