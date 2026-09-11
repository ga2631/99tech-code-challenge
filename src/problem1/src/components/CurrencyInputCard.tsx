import React from 'react';
import { ChevronDown, Wallet } from 'lucide-react';
import { Token } from '../types/token';
import { TokenImage } from './TokenImage';
import { formatCryptoAmount, formatUsd } from '../utils/formatters';

interface CurrencyInputCardProps {
  label: string;
  token: Token | null;
  amount: string;
  onAmountChange?: (val: string) => void;
  onOpenSelectToken: () => void;
  balance: number;
  readOnly?: boolean;
  hasError?: boolean;
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
  onQuickPercent,
  loading = false,
}) => {
  const numericAmount = parseFloat(amount) || 0;
  const usdValue = token ? numericAmount * token.price : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Allow empty or valid decimal numbers only
    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
      if (val.startsWith('.')) {
        val = '0' + val;
      }
      onAmountChange?.(val);
    }
  };

  return (
    <div className={`currency-input-card ${hasError ? 'has-error' : ''}`}>
      <div className="input-top-row">
        <span className="input-label">{label}</span>
        {token && (
          <div className="input-balance">
            <Wallet size={12} />
            <span>
              Bal: {formatCryptoAmount(balance)} {token.symbol}
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

        {onQuickPercent && balance > 0 && !readOnly && (
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
    </div>
  );
};
