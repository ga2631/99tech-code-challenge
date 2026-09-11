export function formatUsd(val: number): string {
  if (isNaN(val) || val === 0) return '$0.00';
  if (val < 0.0001) return `< $0.0001`;
  if (val < 1) {
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  }
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCryptoAmount(val: number, maxDecimals: number = 6): string {
  if (isNaN(val) || val === 0) return '0';
  if (val < 0.000001) {
    return val.toExponential(4);
  }
  const formatted = val.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
  return formatted;
}

export function formatRate(val: number): string {
  if (isNaN(val) || val === 0) return '0';
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
