import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Repeat, Info, Zap } from 'lucide-react';
import { SwapQuote } from '../types/token';
import { formatCryptoAmount, formatRate, formatUsd } from '../utils/formatters';

interface SwapDetailsProps {
  quote: SwapQuote;
}

export const SwapDetails: React.FC<SwapDetailsProps> = ({ quote }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInverseRate, setShowInverseRate] = useState(false);

  const currentRate = showInverseRate ? quote.inverseRate : quote.effectiveRate;
  const fromSymbol = showInverseRate ? quote.toToken.symbol : quote.fromToken.symbol;
  const toSymbol = showInverseRate ? quote.fromToken.symbol : quote.toToken.symbol;

  return (
    <div className="swap-details-box">
      <div className="details-summary-row" onClick={() => setIsExpanded(!isExpanded)}>
        <div
          className="rate-text"
          onClick={(e) => {
            e.stopPropagation();
            setShowInverseRate(!showInverseRate);
          }}
          title="Click to toggle inverse rate"
        >
          <Zap size={14} style={{ color: 'var(--primary-500)' }} />
          <span>
            1 {fromSymbol} = {formatRate(currentRate)} {toSymbol}
          </span>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', padding: '2px' }}
          >
            <Repeat size={12} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.75rem' }}>Details</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {isExpanded && (
        <div className="details-expanded-list">
          <div className="detail-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={12} /> Expected Output (Net)
            </span>
            <span className="detail-val" style={{ color: 'var(--accent-emerald)' }}>
              {formatCryptoAmount(quote.toAmount, 6)} {quote.toToken.symbol}
            </span>
          </div>

          <div className="detail-row">
            <span>Trading Fee ({quote.feePercent}%)</span>
            <span className="detail-val">
              {formatCryptoAmount(quote.feeAmount, 6)} {quote.fromToken.symbol} ({formatUsd(quote.feeUsd)})
            </span>
          </div>

          <div className="detail-row">
            <span>Price Impact</span>
            <span className="detail-val impact-good">
              {quote.priceImpact < 0.01 ? '< 0.01%' : `${quote.priceImpact.toFixed(2)}%`}
            </span>
          </div>

          <div className="detail-row">
            <span>Minimum Received (after {quote.slippageTolerance}%)</span>
            <span className="detail-val">
              {formatCryptoAmount(quote.minimumReceived, 6)} {quote.toToken.symbol}
            </span>
          </div>

          <div className="detail-row">
            <span>Network Gas Fee (Estimated)</span>
            <span className="detail-val">{formatUsd(quote.estimatedGasUsd)}</span>
          </div>

          <div className="detail-row">
            <span>Order Routing</span>
            <span className="detail-val" style={{ color: 'var(--accent-cyan)' }}>
              {quote.route.join(' → ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
