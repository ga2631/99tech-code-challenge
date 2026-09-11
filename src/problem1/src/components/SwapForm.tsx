import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowDownUp, Settings2, Sparkles } from 'lucide-react';
import { Token, UserBalance, SlippageOption, SwapQuote, Transaction } from '../types/token';
import { CurrencyInputCard } from './CurrencyInputCard';
import { SwapDetails } from './SwapDetails';
import { TokenSelectModal } from './TokenSelectModal';
import { SlippageSettingsModal } from './SlippageSettingsModal';
import { ConfirmSwapModal } from './ConfirmSwapModal';
import { TransactionStatusModal } from './TransactionStatusModal';
import { formatCryptoAmount, generateMockTxHash, parseNumericInput, toCleanDecimalString } from '../utils/formatters';

interface SwapFormProps {
  tokens: Token[];
  balances: UserBalance;
  onUpdateBalances: (newBalances: UserBalance) => void;
  onAddTransaction: (tx: Transaction) => void;
  isLoadingTokens: boolean;
  onResetBalances?: () => void;
}

export const SwapForm: React.FC<SwapFormProps> = ({
  tokens,
  balances,
  onUpdateBalances,
  onAddTransaction,
  isLoadingTokens,
  onResetBalances,
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
      const parsed = parseNumericInput(customSlippage);
      return parsed <= 0 ? 0.5 : parsed;
    }
    return slippage;
  }, [slippage, customSlippage]);

  // Derived balance calculation with numeric parsing
  const parsedFromAmount = parseNumericInput(fromAmount);
  const fromBalance = fromToken ? (balances[fromToken.symbol] !== undefined ? balances[fromToken.symbol] : 1000) : 0;
  const toBalance = toToken ? (balances[toToken.symbol] !== undefined ? balances[toToken.symbol] : 1000) : 0;

  // Comprehensive Form Validation Logic
  const validation = useMemo(() => {
    if (isLoadingTokens) {
      return { isValid: false, buttonText: 'Loading token rates...', inputError: null };
    }
    if (!fromToken || !toToken) {
      return { isValid: false, buttonText: 'Select tokens', inputError: null };
    }
    if (fromToken.symbol === toToken.symbol) {
      return { isValid: false, buttonText: 'Select different tokens', inputError: 'Source and target tokens must be different' };
    }
    if (!fromToken.price || fromToken.price <= 0 || !toToken.price || toToken.price <= 0) {
      return { isValid: false, buttonText: 'Rate unavailable', inputError: 'Live price feed unavailable for selected pair' };
    }
    if (effectiveSlippage <= 0 || effectiveSlippage > 50) {
      return { isValid: false, buttonText: 'Invalid slippage (0.01% - 50%)', inputError: null };
    }
    if (fromAmount === '') {
      return { isValid: false, buttonText: 'Enter an amount', inputError: null };
    }
    if (isNaN(parsedFromAmount) || parsedFromAmount <= 0) {
      return { isValid: false, buttonText: 'Enter a positive amount', inputError: 'Amount must be greater than 0' };
    }

    // Decimal precision check
    const rawVal = fromAmount.replace(/,/g, '');
    if (rawVal.includes('.')) {
      const decimals = rawVal.split('.')[1]?.length || 0;
      if (decimals > fromToken.decimals) {
        return {
          isValid: false,
          buttonText: `Max ${fromToken.decimals} decimal places`,
          inputError: `Exceeded maximum ${fromToken.decimals} decimals for ${fromToken.symbol}`,
        };
      }
    }

    // Insufficient Balance check (with small epsilon for float precision safety)
    if (parsedFromAmount > fromBalance + 1e-9) {
      return {
        isValid: false,
        buttonText: `Insufficient ${fromToken.symbol} balance`,
        inputError: `Insufficient balance (Available: ${formatCryptoAmount(fromBalance, 6, 6)} ${fromToken.symbol})`,
      };
    }

    return { isValid: true, buttonText: 'Swap Tokens', inputError: null };
  }, [isLoadingTokens, fromToken, toToken, fromAmount, parsedFromAmount, fromBalance, effectiveSlippage]);

  // Quote computation with DEX trading fee (0.25%)
  const quote: SwapQuote | null = useMemo(() => {
    if (!fromToken || !toToken || parsedFromAmount <= 0 || !fromToken.price || !toToken.price) {
      return null;
    }

    const FEE_PERCENT = 0.25; // Standard 0.25% liquidity provider / protocol fee
    const feeAmount = parsedFromAmount * (FEE_PERCENT / 100);
    const feeUsd = feeAmount * fromToken.price;
    const effectiveFromAmount = Math.max(0, parsedFromAmount - feeAmount);

    const nominalRate = fromToken.price / toToken.price;
    const grossToAmount = parsedFromAmount * nominalRate;
    const toAmount = effectiveFromAmount * nominalRate;

    const effectiveRate = parsedFromAmount > 0 ? toAmount / parsedFromAmount : nominalRate;
    const inverseRate = toAmount > 0 ? parsedFromAmount / toAmount : 1 / nominalRate;
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
      grossToAmount,
      feePercent: FEE_PERCENT,
      feeAmount,
      feeUsd,
      rate: nominalRate,
      effectiveRate,
      inverseRate,
      priceImpact,
      minimumReceived,
      estimatedGasUsd: 1.45,
      slippageTolerance: effectiveSlippage,
      route: [fromToken.symbol, toToken.symbol],
    };
  }, [fromToken, toToken, parsedFromAmount, effectiveSlippage]);

  const toAmountString = quote ? formatCryptoAmount(quote.toAmount, 6) : '';

  // Actions
  const handleFlipTokens = () => {
    const tempFromToken = fromToken;
    const tempToToken = toToken;
    setFromToken(tempToToken);
    setToToken(tempFromToken);

    // If there was an output amount, make it the new input amount formatted cleanly without commas
    if (quote && quote.toAmount > 0) {
      setFromAmount(toCleanDecimalString(quote.toAmount, tempToToken ? Math.min(tempToToken.decimals, 6) : 6, true));
    }
  };

  const handleSelectQuickPercent = (pct: number) => {
    if (!fromToken) return;
    const targetAmount = fromBalance * pct;
    setFromAmount(toCleanDecimalString(targetAmount, Math.min(fromToken.decimals, 6), true));
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
    const fromQty = quote.fromAmount;
    const toQty = quote.toAmount;

    const newTx: Transaction = {
      id: Date.now().toString(),
      hash: mockHash,
      fromSymbol: fromToken.symbol,
      toSymbol: toToken.symbol,
      fromAmount: fromQty,
      toAmount: toQty,
      fromUsd: fromQty * fromToken.price,
      toUsd: toQty * toToken.price,
      feeAmount: quote.feeAmount,
      feeUsd: quote.feeUsd,
      rate: quote.effectiveRate,
      timestamp: Date.now(),
      status: 'pending',
    };

    setCurrentTx(newTx);
    setIsConfirmOpen(false);
    setTxModalStatus('pending');

    // Simulate asynchronous blockchain transaction processing
    setTimeout(() => {
      // Update balances using exact numbers with clean float precision
      const newBalances = { ...balances };
      const currentFrom = balances[fromToken.symbol] !== undefined ? balances[fromToken.symbol] : fromBalance;
      const currentTo = balances[toToken.symbol] !== undefined ? balances[toToken.symbol] : toBalance;

      const diff = currentFrom - fromQty;
      const nextFrom = diff < 1e-6 ? 0 : diff;
      const nextTo = currentTo + toQty;

      newBalances[fromToken.symbol] = nextFrom < 1e-6 ? 0 : parseFloat(nextFrom.toFixed(8));
      newBalances[toToken.symbol] = nextTo < 1e-6 ? 0 : parseFloat(nextTo.toFixed(8));
      onUpdateBalances(newBalances);

      // Record transaction
      const successTx: Transaction = { ...newTx, status: 'success' };
      onAddTransaction(successTx);
      setCurrentTx(successTx);
      setTxModalStatus('success');
      setIsExecuting(false);

      // Reset input
      setFromAmount('');
    }, 2000);
  }, [quote, fromToken, toToken, balances, fromBalance, toBalance, onUpdateBalances, onAddTransaction]);

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
        hasError={validation.inputError !== null}
        errorMessage={validation.inputError}
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
        className={`swap-action-button ${!validation.isValid && fromAmount ? 'btn-error' : ''}`}
        disabled={!validation.isValid}
        onClick={() => setIsConfirmOpen(true)}
      >
        {validation.buttonText}
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
