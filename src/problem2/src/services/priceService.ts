import { RawPriceItem, Token } from '../types/token';
import { BASE_TOKEN_ICON_URL, LOCAL_PRICES_URL, PRICES_API_URL, TOKEN_METADATA } from '../constants/tokens';

const FALLBACK_PRICES: RawPriceItem[] = [
  { currency: 'ETH', date: '2023-08-29T07:10:52.000Z', price: 1645.9337 },
  { currency: 'WBTC', date: '2023-08-29T07:10:52.000Z', price: 26002.822 },
  { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 1.0 },
  { currency: 'BUSD', date: '2023-08-29T07:10:40.000Z', price: 0.9998 },
  { currency: 'SWTH', date: '2023-08-29T07:10:45.000Z', price: 0.0040398 },
  { currency: 'ATOM', date: '2023-08-29T07:10:50.000Z', price: 7.1866 },
  { currency: 'OSMO', date: '2023-08-29T07:10:50.000Z', price: 0.3772 },
  { currency: 'GMX', date: '2023-08-29T07:10:40.000Z', price: 36.345 },
  { currency: 'LUNA', date: '2023-08-29T07:10:40.000Z', price: 0.4095 },
  { currency: 'wstETH', date: '2023-08-29T07:10:40.000Z', price: 1872.257 },
  { currency: 'BLUR', date: '2023-08-29T07:10:40.000Z', price: 0.2081 },
  { currency: 'OKB', date: '2023-08-29T07:10:40.000Z', price: 42.975 },
  { currency: 'KUJI', date: '2023-08-29T07:10:45.000Z', price: 0.675 },
  { currency: 'STRD', date: '2023-08-29T07:10:40.000Z', price: 0.7386 },
  { currency: 'EVMOS', date: '2023-08-29T07:10:40.000Z', price: 0.0624 },
  { currency: 'STATOM', date: '2023-08-29T07:10:45.000Z', price: 8.5121 },
  { currency: 'STOSMO', date: '2023-08-29T07:10:45.000Z', price: 0.4313 },
  { currency: 'ZIL', date: '2023-08-29T07:10:50.000Z', price: 0.0165 },
];

export async function fetchTokenPrices(): Promise<{ tokens: Token[]; lastUpdated: Date }> {
  let rawData: RawPriceItem[] = [];

  try {
    const response = await fetch(PRICES_API_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    rawData = await response.json();
  } catch (err) {
    try {
      const localResponse = await fetch(LOCAL_PRICES_URL);
      if (localResponse.ok) {
        rawData = await localResponse.json();
      } else {
        rawData = FALLBACK_PRICES;
      }
    } catch {
      rawData = FALLBACK_PRICES;
    }
  }

  // Deduplicate by latest timestamp and valid price
  const latestByCurrency = new Map<string, RawPriceItem>();

  for (const item of rawData) {
    if (!item.currency || typeof item.price !== 'number' || item.price <= 0) {
      continue;
    }

    const existing = latestByCurrency.get(item.currency);
    if (!existing) {
      latestByCurrency.set(item.currency, item);
    } else {
      const existingDate = new Date(existing.date).getTime();
      const currentDate = new Date(item.date).getTime();
      if (currentDate >= existingDate) {
        latestByCurrency.set(item.currency, item);
      }
    }
  }

  const tokens: Token[] = Array.from(latestByCurrency.values())
    .map((item) => {
      const meta = TOKEN_METADATA[item.currency] || {
        name: item.currency,
        decimals: 6,
        color: '#6366F1',
      };

      return {
        symbol: item.currency,
        name: meta.name,
        price: item.price,
        date: item.date,
        decimals: meta.decimals,
        color: meta.color,
        iconUrl: `${BASE_TOKEN_ICON_URL}/${item.currency}.svg`,
      };
    })
    .sort((a, b) => {
      // Put popular or high market cap tokens first
      const aScore = a.symbol === 'ETH' ? 100 : a.symbol === 'WBTC' ? 90 : a.symbol === 'USDC' ? 80 : 0;
      const bScore = b.symbol === 'ETH' ? 100 : b.symbol === 'WBTC' ? 90 : b.symbol === 'USDC' ? 80 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return a.symbol.localeCompare(b.symbol);
    });

  return {
    tokens,
    lastUpdated: new Date(),
  };
}
