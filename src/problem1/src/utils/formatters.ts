export function parseNumericInput(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') {
    if (isNaN(val) || Math.abs(val) < 1e-6) return 0;
    return val;
  }
  // Strip all thousands separator commas and whitespace
  const cleaned = val.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num) || Math.abs(num) < 1e-6) return 0;
  return num;
}

export function truncateDecimals(val: number, maxDecimals: number = 6): number {
  if (isNaN(val) || val === 0 || Math.abs(val) < 1e-6) return 0;
  const factor = Math.pow(10, maxDecimals);
  const res = Math.floor(val * factor + 1e-12) / factor;
  return Math.abs(res) < 1e-6 ? 0 : res;
}

export function toCleanDecimalString(val: number, maxDecimals: number = 6, truncate: boolean = false): string {
  if (isNaN(val) || val === 0 || Math.abs(val) < 1e-6) return '0';
  if (truncate) {
    const floored = truncateDecimals(val, maxDecimals);
    return floored === 0 || Math.abs(floored) < 1e-6 ? '0' : floored.toString();
  }
  const fixed = val.toFixed(maxDecimals);
  const num = parseFloat(fixed);
  // Remove trailing zeros after decimal point
  return Math.abs(num) < 1e-6 ? '0' : num.toString();
}

export function formatCryptoAmount(
  val: number,
  maxDecimals: number = 6,
  minDecimals: number = 0
): string {
  if (isNaN(val) || val === 0 || Math.abs(val) < 1e-6) {
    return minDecimals > 0 ? (0).toFixed(minDecimals) : '0';
  }
  return val.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

export function formatUsd(val: number): string {
  if (isNaN(val) || val === 0 || Math.abs(val) < 1e-6) return '$0.00';
  if (val < 0.0001) return `< $0.0001`;
  if (val < 1) {
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  }
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsdc(val: number, maxDecimals: number = 2, minDecimals: number = 2): string {
  if (isNaN(val) || val === 0 || Math.abs(val) < 1e-6) return '0.00 USDC';
  return `${formatCryptoAmount(val, maxDecimals, minDecimals)} USDC`;
}

export function formatRate(val: number): string {
  if (isNaN(val) || val === 0 || Math.abs(val) < 1e-6) return '0';
  if (val < 0.0001) return val.toExponential(4);
  if (val < 1) return val.toFixed(6);
  if (val < 100) return val.toFixed(4);
  return val.toFixed(2);
}

export function formatPercent(val: number): string {
  return `${(val * 100).toFixed(2)}%`;
}

export function truncateHash(hash: string, chars: number = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
