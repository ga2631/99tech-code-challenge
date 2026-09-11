import React from 'react';
import { RefreshCw, History, Settings, Wallet } from 'lucide-react';
import { formatUsd } from '../utils/formatters';
import { BASE_TOKEN_ICON_URL } from '../constants/tokens';

interface HeaderProps {
  portfolioUsd: number;
  lastUpdated: Date | null;
  onRefreshPrices: () => void;
  isRefreshing: boolean;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  txCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  portfolioUsd,
  onRefreshPrices,
  isRefreshing,
  onOpenHistory,
  onOpenSettings,
  txCount,
}) => {
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
        <button
          type="button"
          className="icon-button"
          onClick={onRefreshPrices}
          disabled={isRefreshing}
          title="Refresh token prices"
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinner' : ''} />
        </button>

        <div className="wallet-badge" title="Total Mock Wallet Value">
          <Wallet size={14} style={{ color: 'var(--primary-500)' }} />
          <span>{formatUsd(portfolioUsd)}</span>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onOpenHistory}
          title="Transaction History"
          style={{ position: 'relative' }}
        >
          <History size={16} />
          {txCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--primary-500)',
                color: 'white',
                fontSize: '0.625rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {txCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={onOpenSettings}
          title="Swap Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
