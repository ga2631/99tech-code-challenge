import React from 'react';
import { X, Trash2, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types/token';
import { TokenImage } from './TokenImage';
import { formatCryptoAmount, formatTimestamp, formatUsd, truncateHash } from '../utils/formatters';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onClearHistory: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Recent Transactions</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {transactions.length > 0 && (
              <button
                className="icon-button"
                onClick={onClearHistory}
                title="Clear History"
                style={{ width: '32px', height: '32px', color: 'var(--accent-rose)' }}
              >
                <Trash2 size={14} />
              </button>
            )}
            <button className="icon-button" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="token-list-container" style={{ maxHeight: '380px', padding: '0.75rem' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>No Swaps Yet</div>
              <div style={{ fontSize: '0.8125rem' }}>Your past transaction history will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <TokenImage symbol={tx.fromSymbol} size={24} />
                      <div style={{ marginLeft: '-8px' }}>
                        <TokenImage symbol={tx.toSymbol} size={24} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>
                          {formatCryptoAmount(tx.fromAmount)} {tx.fromSymbol} → {formatCryptoAmount(tx.toAmount)} {tx.toSymbol}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatTimestamp(tx.timestamp)} • {formatUsd(tx.fromUsd)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--primary-500)',
                        textDecoration: 'none',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                      }}
                      title="View on block explorer"
                    >
                      <span>{truncateHash(tx.hash, 4)}</span>
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
