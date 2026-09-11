import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowDownUp, Settings2 } from 'lucide-react';
import { Token, UserBalance, SlippageOption, SwapQuote, Transaction } from '../types/token';
import { CurrencyInputCard } from './CurrencyInputCard';
import { SwapDetails } from './SwapDetails';
import { TokenSelectModal } from './TokenSelectModal';
import { SlippageSettingsModal } from './SlippageSettingsModal';
import { ConfirmSwapModal } from './ConfirmSwapModal';
import { TransactionStatusModal } from './TransactionStatusModal';
import { formatCryptoAmount, generateMockTxHash } from '../utils/formatters';

interface SwapFormProps {
  tokens: Token[];
  balances: UserBalance;
  onUpdateBalances: (newBalances: UserBalance) => void;
  onAddTransaction: (tx: Transaction) => void;
  isLoadingTokens: boolean;
}

export const SwapForm: React.FC<SwapFormProps> = ({
  tokens,
  balances,
  onUpdateBalances,
  onAddTransaction,
  isLoadingTokens,
}) => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [isSelectingFor, setIsSelectingFor] = useState<'from' | 'to' | null>(null);

  // Settings
  const [slippage, setSlippage] = useState<SlippageOption>(0.5);
  const [customSlippage, setCustomSlippage] = useState<string>('');
  const [deadlineMinutes, setDeadlineMinutes] = useState<number>(20);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Transaction modals & execution
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [txModalStatus, setTxModalStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);

  // Initialize default tokens (ETH -> USDC)
  useEffect(() => {
    if (tokens.length > 0) {
      if (!fromToken) {
        const defaultFrom = tokens.find((t) => t.symbol === 'ETH') || tokens[0];
        setFromToken(defaultFrom);
      }
      if (!toToken) {
        const defaultTo = tokens.find((t) => t.symbol === 'USDC') || tokens[1] || tokens[0];
        setToToken(defaultTo);
      }
    }
  }, [tokens, fromToken, toToken]);

  const effectiveSlippage = useMemo(() => {
    if (slippage === 'custom') {
      const parsed = parseFloat(customSlippage);
      return isNaN(parsed) || parsed <= 0 ? 0.5 : parsed;
    }
    return slippage;
  }, [slippage, customSlippage]);

  // Derived calculation
  const parsedFromAmount = parseFloat(fromAmount) || 0;
  const fromBalance = fromToken ? balances[fromToken.symbol] || 0 : 0;
  const toBalance = toToken ? balances[toToken.symbol] || 0 : 0;

  const quote: SwapQuote | null = useMemo(() => {
    if (!fromToken || !toToken || parsedFromAmount <= 0) {
      return null;
    }

    const rate = fromToken.price / toToken.price;
    const inverseRate = toToken.price / fromToken.price;
    const toAmount = parsedFromAmount * rate;
    const slippageMultiplier = 1 - effectiveSlippage / 100;
    const minimumReceived = toAmount * slippageMultiplier;

    // Simulate small realistic price impact based on amount
    const fromUsd = parsedFromAmount * fromToken.price;
    const priceImpact = Math.min(5.0, Math.max(0.01, (fromUsd / 100000) * 0.1));

    return {
      fromToken,
      toToken,
      fromAmount: parsedFromAmount,
      toAmount,
      rate,
      inverseRate,
      priceImpact,
      minimumReceived,
      estimatedGasUsd: 1.45,
      slippageTolerance: effectiveSlippage,
      route: [fromToken.symbol, toToken.symbol],
    };
  }, [fromToken, toToken, parsedFromAmount, effectiveSlippage]);

  const toAmountString = quote ? formatCryptoAmount(quote.toAmount, 6) : '';

  // Form Validations
  const validationError = useMemo(() => {
    if (isLoadingTokens) return 'Loading token rates...';
    if (!fromToken || !toToken) return 'Select tokens';
    if (fromToken.symbol === toToken.symbol) return 'Select different tokens';
    if (!fromAmount || parsedFromAmount <= 0) return 'Enter an amount';
    if (parsedFromAmount > fromBalance) return `Insufficient ${fromToken.symbol} balance`;
    return null;
  }, [isLoadingTokens, fromToken, toToken, fromAmount, parsedFromAmount, fromBalance]);

  const isFormValid = validationError === null && quote !== null;

  // Actions
  const handleFlipTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    // If there was an output amount, make it the new input amount
    if (quote && quote.toAmount > 0) {
      setFromAmount(quote.toAmount.toFixed(4));
    }
  };

  const handleSelectQuickPercent = (pct: number) => {
    if (!fromToken) return;
    const targetAmount = fromBalance * pct;
    // Format nicely without excessive precision
    setFromAmount(targetAmount > 0 ? targetAmount.toFixed(4) : '0');
  };

  const handleSelectToken = (token: Token) => {
    if (isSelectingFor === 'from') {
      if (toToken && token.symbol === toToken.symbol) {
        // Swap if same
        setToToken(fromToken);
      }
      setFromToken(token);
    } else if (isSelectingFor === 'to') {
      if (fromToken && token.symbol === fromToken.symbol) {
        // Swap if same
        setFromToken(toToken);
      }
      setToToken(token);
    }
    setIsSelectingFor(null);
  };

  const handleExecuteSwap = useCallback(async () => {
    if (!quote || !fromToken || !toToken) return;

    setIsExecuting(true);
    const mockHash = generateMockTxHash();
    const newTx: Transaction = {
      id: Date.now().toString(),
      hash: mockHash,
      fromSymbol: fromToken.symbol,
      toSymbol: toToken.symbol,
      fromAmount: quote.fromAmount,
      toAmount: quote.toAmount,
      fromUsd: quote.fromAmount * fromToken.price,
      toUsd: quote.toAmount * toToken.price,
      rate: quote.rate,
      timestamp: Date.now(),
      status: 'pending',
    };

    setCurrentTx(newTx);
    setIsConfirmOpen(false);
    setTxModalStatus('pending');

    // Simulate asynchronous blockchain transaction processing
    setTimeout(() => {
      // Update balances
      const newBalances = { ...balances };
      newBalances[fromToken.symbol] = Math.max(0, (newBalances[fromToken.symbol] || 0) - quote.fromAmount);
      newBalances[toToken.symbol] = (newBalances[toToken.symbol] || 0) + quote.toAmount;
      onUpdateBalances(newBalances);

      // Record transaction
      const successTx: Transaction = { ...newTx, status: 'success' };
      onAddTransaction(successTx);
      setCurrentTx(successTx);
      setTxModalStatus('success');
      setIsExecuting(false);

      // Reset input
      setFromAmount('');
    }, 2200);
  }, [quote, fromToken, toToken, balances, onUpdateBalances, onAddTransaction]);

  return (
    <div className="swap-card">
      {/* Header of Swap Card */}
      <div className="swap-card-header">
        <div className="swap-title">
          <span>Swap Assets</span>
        </div>
        <div className="swap-header-controls">
          <button
            type="button"
            className="icon-button"
            onClick={() => setIsSettingsOpen(true)}
            title="Slippage & Deadline Settings"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {/* From Currency Input */}
      <CurrencyInputCard
        label="You Pay"
        token={fromToken}
        amount={fromAmount}
        onAmountChange={setFromAmount}
        onOpenSelectToken={() => setIsSelectingFor('from')}
        balance={fromBalance}
        hasError={parsedFromAmount > fromBalance}
        onQuickPercent={handleSelectQuickPercent}
      />

      {/* Flip Button */}
      <div className="swap-flip-container">
        <button
          type="button"
          className="swap-flip-button"
          onClick={handleFlipTokens}
          aria-label="Swap currency directions"
        >
          <ArrowDownUp size={18} />
        </button>
      </div>

      {/* To Currency Input */}
      <CurrencyInputCard
        label="You Receive"
        token={toToken}
        amount={toAmountString}
        onOpenSelectToken={() => setIsSelectingFor('to')}
        balance={toBalance}
        readOnly
      />

      {/* Swap Details Accordion */}
      {quote && <SwapDetails quote={quote} />}

      {/* Submit Button */}
      <button
        type="button"
        className={`swap-action-button ${validationError && fromAmount ? 'btn-error' : ''}`}
        disabled={!isFormValid}
        onClick={() => setIsConfirmOpen(true)}
      >
        {validationError || 'Swap Tokens'}
      </button>

      {/* Modals */}
      <TokenSelectModal
        isOpen={isSelectingFor !== null}
        onClose={() => setIsSelectingFor(null)}
        tokens={tokens}
        selectedToken={isSelectingFor === 'from' ? fromToken : toToken}
        otherSelectedToken={isSelectingFor === 'from' ? toToken : fromToken}
        onSelectToken={handleSelectToken}
        balances={balances}
      />

      <SlippageSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        slippage={slippage}
        customSlippage={customSlippage}
        onSelectSlippage={setSlippage}
        onCustomSlippageChange={setCustomSlippage}
        deadlineMinutes={deadlineMinutes}
        onDeadlineChange={setDeadlineMinutes}
      />

      {quote && (
        <ConfirmSwapModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleExecuteSwap}
          quote={quote}
          isLoading={isExecuting}
        />
      )}

      <TransactionStatusModal
        isOpen={txModalStatus !== 'idle'}
        onClose={() => setTxModalStatus('idle')}
        status={txModalStatus === 'idle' ? 'pending' : txModalStatus}
        tx={currentTx}
        onRetry={handleExecuteSwap}
      />
    </div>
  );
};
