import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { Transaction } from '../types/token';
import { TokenImage } from './TokenImage';
import { formatCryptoAmount, truncateHash, formatUsd } from '../utils/formatters';

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'pending' | 'success' | 'failed';
  tx: Transaction | null;
  errorMessage?: string;
  onRetry?: () => void;
}

export const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  tx,
  errorMessage,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tx) return null;

  const handleCopyHash = () => {
    if (tx.hash) {
      navigator.clipboard.writeText(tx.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={status !== 'pending' ? onClose : undefined}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            {status === 'pending'
              ? 'Transaction Pending'
              : status === 'success'
              ? 'Swap Submitted'
              : 'Transaction Failed'}
          </span>
          {status !== 'pending' && (
            <button className="icon-button" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
          {status === 'pending' && (
            <>
              <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    border: '3px solid rgba(99, 102, 241, 0.2)',
                    borderTopColor: 'var(--primary-500)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Swapping {formatCryptoAmount(tx.fromAmount)} {tx.fromSymbol} for {formatCryptoAmount(tx.toAmount)} {tx.toSymbol}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Broadcasting order to decentralized network...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.25)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Swap Completed Successfully!
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Swapped {formatCryptoAmount(tx.fromAmount)} {tx.fromSymbol} ({formatUsd(tx.fromUsd)}) for{' '}
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {formatCryptoAmount(tx.toAmount)} {tx.toSymbol}
                  </span>
                </p>
              </div>

              {/* Token icons pair */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <TokenImage symbol={tx.fromSymbol} size={24} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{tx.fromSymbol}</span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <TokenImage symbol={tx.toSymbol} size={24} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{tx.toSymbol}</span>
              </div>

              {/* Hash container */}
              <div style={{ width: '100%', background: 'var(--bg-input)', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction Hash</div>
                  <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {truncateHash(tx.hash, 8)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="icon-button"
                    style={{ width: '32px', height: '32px' }}
                    onClick={handleCopyHash}
                    title="Copy Transaction Hash"
                  >
                    {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-button"
                    style={{ width: '32px', height: '32px', textDecoration: 'none' }}
                    title="View on Explorer"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <button
                type="button"
                className="swap-action-button"
                style={{ marginTop: '0.5rem' }}
                onClick={onClose}
              >
                Done
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '2px solid var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-rose)',
                }}
              >
                <AlertCircle size={36} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Swap Failed
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--accent-rose)' }}>
                  {errorMessage || 'Transaction was rejected or slippage tolerance was exceeded.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="slippage-btn"
                  style={{ flex: 1, padding: '0.75rem' }}
                  onClick={onClose}
                >
                  Dismiss
                </button>
                {onRetry && (
                  <button
                    type="button"
                    className="swap-action-button"
                    style={{ flex: 1, marginTop: 0, padding: '0.75rem' }}
                    onClick={onRetry}
                  >
                    Retry Swap
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
