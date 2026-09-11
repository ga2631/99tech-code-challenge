import React from 'react';
import { ChevronDown, Wallet, AlertCircle } from 'lucide-react';
import { Token } from '../types/token';
import { TokenImage } from './TokenImage';
import { formatCryptoAmount, formatUsd, parseNumericInput } from '../utils/formatters';

interface CurrencyInputCardProps {
  label: string;
  token: Token | null;
  amount: string;
  onAmountChange?: (val: string) => void;
  onOpenSelectToken: () => void;
  balance: number;
  readOnly?: boolean;
  hasError?: boolean;
  errorMessage?: string | null;
  onQuickPercent?: (pct: number) => void;
  loading?: boolean;
}

export const CurrencyInputCard: React.FC<CurrencyInputCardProps> = ({
  label,
  token,
  amount,
  onAmountChange,
  onOpenSelectToken,
  balance,
  readOnly = false,
  hasError = false,
  errorMessage = null,
  onQuickPercent,
  loading = false,
}) => {
  const numericAmount = parseNumericInput(amount);
  const usdValue = token ? numericAmount * token.price : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, '').trim();
    // Allow empty or valid decimal numbers only
    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
      if (val.startsWith('.')) {
        val = '0' + val;
      }
      // Limit decimal precision if token is defined
      if (token && val.includes('.')) {
        const decimals = val.split('.')[1];
        if (decimals && decimals.length > token.decimals) {
          return; // Don't allow typing beyond max decimals
        }
      }
      onAmountChange?.(val);
    }
  };

  return (
    <div className={`currency-input-card ${hasError ? 'has-error' : ''}`}>
      <div className="input-top-row">
        <span className="input-label">{label}</span>
        {token && (
          <div
            className="input-balance"
            style={{ cursor: !readOnly && onQuickPercent ? 'pointer' : 'default' }}
            onClick={() => !readOnly && onQuickPercent && onQuickPercent(1.0)}
            title={!readOnly ? 'Click to fill max balance' : undefined}
          >
            <Wallet size={12} />
            <span>
              Bal: {formatCryptoAmount(balance, 6, 6)} {token.symbol}
            </span>
          </div>
        )}
      </div>

      <div className="input-main-row">
        <input
          type="text"
          inputMode="decimal"
          className="amount-input"
          placeholder="0.0"
          value={amount}
          onChange={handleInputChange}
          readOnly={readOnly}
          autoComplete="off"
        />

        <button
          type="button"
          className="token-select-button"
          onClick={onOpenSelectToken}
          aria-label={`Select token, current: ${token?.symbol || 'None'}`}
        >
          {token ? (
            <>
              <TokenImage symbol={token.symbol} size={24} />
              <span>{token.symbol}</span>
            </>
          ) : (
            <span>Select Token</span>
          )}
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="input-bottom-row">
        <span className="usd-estimate">
          {loading ? 'Calculating...' : `≈ ${formatUsd(usdValue)}`}
        </span>

        {onQuickPercent && !readOnly && (
          <div className="percentage-chips">
            <button type="button" className="chip-btn" onClick={() => onQuickPercent(0.25)}>
              25%
            </button>
            <button type="button" className="chip-btn" onClick={() => onQuickPercent(0.5)}>
              50%
            </button>
            <button type="button" className="chip-btn" onClick={() => onQuickPercent(0.75)}>
              75%
            </button>
            <button type="button" className="chip-btn" onClick={() => onQuickPercent(1.0)}>
              MAX
            </button>
          </div>
        )}
      </div>

      {/* Inline Validation Error */}
      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: 500 }}>
          <AlertCircle size={13} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
