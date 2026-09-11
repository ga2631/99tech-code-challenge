import React from 'react';
import { X, ArrowDown, ShieldCheck } from 'lucide-react';
import { SwapQuote } from '../types/token';
import { TokenImage } from './TokenImage';
import { formatCryptoAmount, formatRate, formatUsd } from '../utils/formatters';

interface ConfirmSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quote: SwapQuote;
  isLoading: boolean;
}

export const ConfirmSwapModal: React.FC<ConfirmSwapModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  quote,
  isLoading,
}) => {
  if (!isOpen) return null;

  const fromUsd = quote.fromAmount * quote.fromToken.price;
  const toUsd = quote.toAmount * quote.toToken.price;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Review Swap</span>
          <button className="icon-button" onClick={onClose} disabled={isLoading} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="confirm-swap-body">
          {/* From Item */}
          <div className="swap-preview-row">
            <div className="preview-token-info">
              <TokenImage symbol={quote.fromToken.symbol} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{quote.fromToken.symbol}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.fromToken.name}</div>
              </div>
            </div>
            <div className="preview-token-amount">
              <div className="preview-amount-val">
                {formatCryptoAmount(quote.fromAmount)} {quote.fromToken.symbol}
              </div>
              <div className="preview-amount-usd">≈ {formatUsd(fromUsd)}</div>
            </div>
          </div>

          {/* Arrow Divider */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '50%', padding: '6px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <ArrowDown size={16} />
            </div>
          </div>

          {/* To Item */}
          <div className="swap-preview-row">
            <div className="preview-token-info">
              <TokenImage symbol={quote.toToken.symbol} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{quote.toToken.symbol}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.toToken.name}</div>
              </div>
            </div>
            <div className="preview-token-amount">
              <div className="preview-amount-val" style={{ color: 'var(--accent-emerald)' }}>
                +{formatCryptoAmount(quote.toAmount)} {quote.toToken.symbol}
              </div>
              <div className="preview-amount-usd">≈ {formatUsd(toUsd)}</div>
            </div>
          </div>

          {/* Breakdown List */}
          <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '0.875rem', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <div className="detail-row">
              <span>Exchange Rate</span>
              <span className="detail-val">
                1 {quote.fromToken.symbol} = {formatRate(quote.effectiveRate)} {quote.toToken.symbol}
              </span>
            </div>
            <div className="detail-row">
              <span>Trading Fee ({quote.feePercent}%)</span>
              <span className="detail-val">
                {formatCryptoAmount(quote.feeAmount, 6)} {quote.fromToken.symbol} ({formatUsd(quote.feeUsd)})
              </span>
            </div>
            <div className="detail-row">
              <span>Guaranteed Minimum</span>
              <span className="detail-val">
                {formatCryptoAmount(quote.minimumReceived, 6)} {quote.toToken.symbol}
              </span>
            </div>
            <div className="detail-row">
              <span>Slippage Tolerance</span>
              <span className="detail-val">{quote.slippageTolerance}%</span>
            </div>
            <div className="detail-row">
              <span>Network Gas Fee</span>
              <span className="detail-val">{formatUsd(quote.estimatedGasUsd)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Optimal routing with MEV protection enabled.</span>
          </div>

          <button
            type="button"
            className="swap-action-button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                <span>Processing Swap...</span>
              </>
            ) : (
              'Confirm Swap'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
