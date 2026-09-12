import React, { useMemo } from 'react';
import { RotateCcw, Wallet, Coins, TrendingUp } from 'lucide-react';
import { formatCryptoAmount, formatUsdc } from '../utils/formatters';
import { BASE_TOKEN_ICON_URL } from '../constants/tokens';
import { Token, UserBalance } from '../types/token';
import { TokenImage } from './TokenImage';

interface HeaderProps {
  portfolioUsdc: number;
  tokens: Token[];
  balances: UserBalance;
  lastUpdated: Date | null;
  onResetData: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  portfolioUsdc,
  tokens,
  balances,
  onResetData,
  isResetting,
}) => {
  // Compute list of tokens currently held with positive balance
  const heldTokens = useMemo(() => {
    const tokenMap = new Map(tokens.map((t) => [t.symbol, t]));
    const items: {
      token: Token;
      balance: number;
      usdcValue: number;
    }[] = [];

    for (const [symbol, balance] of Object.entries(balances)) {
      if (balance >= 1e-6) {
        const found = tokenMap.get(symbol);
        const token: Token = found || {
          symbol,
          name: symbol,
          price: 0,
          decimals: 6,
          date: '',
        };
        const usdcValue = balance * (token.price || 0);
        items.push({ token, balance, usdcValue });
      }
    }

    // Sort by USDC value descending, then by balance
    return items.sort((a, b) => b.usdcValue - a.usdcValue || b.balance - a.balance);
  }, [tokens, balances]);

  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="logo-badge" style={{ background: 'rgba(19, 194, 194, 0.15)', border: '1px solid rgba(19, 194, 194, 0.35)', boxShadow: '0 0 16px rgba(19, 194, 194, 0.25)' }}>
          <img
            src={`${BASE_TOKEN_ICON_URL}/SWTH.svg`}
            alt="CurrencySwap Logo"
            style={{ width: '22px', height: '22px', display: 'block' }}
          />
        </div>
        <span>Currency<span style={{ color: 'var(--accent-cyan)' }}>Swap</span></span>
      </div>

      <div className="header-actions">
        {/* Reset Data Button with Explanatory Tooltip */}
        <div className="tooltip-wrapper">
          <button
            type="button"
            className="icon-button"
            onClick={onResetData}
            disabled={isResetting}
            aria-label="Reset all data to default"
          >
            <RotateCcw size={16} className={isResetting ? 'spinner' : ''} />
          </button>
          <div className="tooltip-content">
            <div className="tooltip-header">
              <RotateCcw size={13} style={{ color: 'var(--accent-cyan)' }} />
              <span>Reset All Data</span>
            </div>
            <div>Khôi phục toàn bộ số dư ví, lịch sử giao dịch và dữ liệu tỷ giá về trạng thái mặc định ban đầu.</div>
          </div>
        </div>

        {/* Wallet Badge with Hoverable Asset Breakdown Dropdown */}
        <div className="wallet-wrapper">
          <div className="wallet-badge" role="button" tabIndex={0} title="Total Wallet Value in USDC">
            <Wallet size={14} style={{ color: 'var(--primary-500)' }} />
            <span>{formatUsdc(portfolioUsdc)}</span>
          </div>

          <div className="wallet-popover">
            <div className="wallet-popover-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Coins size={15} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  Held Assets
                </span>
              </div>
              <span className="wallet-asset-count">
                {heldTokens.length} {heldTokens.length === 1 ? 'Token' : 'Tokens'}
              </span>
            </div>

            <div className="wallet-popover-total">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Balance</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {formatUsdc(portfolioUsdc)}
              </span>
            </div>

            <div className="wallet-token-list">
              {heldTokens.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No active token balances
                </div>
              ) : (
                heldTokens.map(({ token, balance, usdcValue }) => (
                  <div key={token.symbol} className="wallet-token-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <TokenImage symbol={token.symbol} size={26} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                          {token.symbol}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {token.price > 0 ? formatUsdc(token.price, 4, 2) : 'No Price'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {formatCryptoAmount(balance, 6, 2)}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--accent-emerald)', fontWeight: 500 }}>
                        {usdcValue > 0 ? `≈ ${formatUsdc(usdcValue)}` : '0.00 USDC'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="wallet-popover-footer">
              <TrendingUp size={12} style={{ color: 'var(--accent-emerald)' }} />
              <span>Base currency: USDC • Switcheo Live Oracle</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
