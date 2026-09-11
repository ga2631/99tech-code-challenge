import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Token, UserBalance } from '../types/token';
import { POPULAR_TOKENS } from '../constants/tokens';
import { TokenImage } from './TokenImage';
import { formatCryptoAmount, formatUsd } from '../utils/formatters';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  selectedToken: Token | null;
  otherSelectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  balances: UserBalance;
}

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
  isOpen,
  onClose,
  tokens,
  selectedToken,
  otherSelectedToken,
  onSelectToken,
  balances,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredTokens = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tokens;
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  const popularTokenList = useMemo(() => {
    return tokens.filter((t) => POPULAR_TOKENS.includes(t.symbol));
  }, [tokens]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Select a Token</span>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="token-search-container">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Popular tokens chips */}
        {!searchQuery && (
          <div className="popular-tokens-row">
            {popularTokenList.map((token) => (
              <button
                key={token.symbol}
                className="popular-token-chip"
                onClick={() => {
                  onSelectToken(token);
                  onClose();
                }}
              >
                <TokenImage symbol={token.symbol} size={18} />
                <span>{token.symbol}</span>
              </button>
            ))}
          </div>
        )}

        {/* Token List */}
        <div className="token-list-container">
          {filteredTokens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No tokens found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredTokens.map((token) => {
              const isSelected = selectedToken?.symbol === token.symbol;
              const isOtherSelected = otherSelectedToken?.symbol === token.symbol;
              const balance = balances[token.symbol] || 0;

              return (
                <div
                  key={token.symbol}
                  className={`token-list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectToken(token);
                    onClose();
                  }}
                >
                  <div className="token-item-left">
                    <TokenImage symbol={token.symbol} size={32} />
                    <div className="token-symbol-name">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="item-symbol">{token.symbol}</span>
                        {isOtherSelected && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                            Paired
                          </span>
                        )}
                      </div>
                      <span className="item-name">{token.name}</span>
                    </div>
                  </div>

                  <div className="token-item-right">
                    <span className="item-price">{formatUsd(token.price)}</span>
                    <span className="item-balance">
                      {formatCryptoAmount(balance, 6, 6)} {token.symbol}
                    </span>
                  </div>

                  {isSelected && (
                    <div style={{ marginLeft: '0.5rem', color: 'var(--primary-500)' }}>
                      <Check size={16} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
