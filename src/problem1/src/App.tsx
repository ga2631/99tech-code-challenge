import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { SwapForm } from './components/SwapForm';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { Token, UserBalance, Transaction } from './types/token';
import { INITIAL_USER_BALANCES } from './constants/tokens';
import { fetchTokenPrices } from './services/priceService';
import { formatUsd } from './utils/formatters';

const BALANCES_STORAGE_KEY = 'novaswap_user_balances_v1';
const TXS_STORAGE_KEY = 'novaswap_transactions_v1';

export function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load persisted balances or default
  const [balances, setBalances] = useState<UserBalance>(() => {
    try {
      const saved = localStorage.getItem(BALANCES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER_BALANCES;
  });

  // Load persisted transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(TXS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Save balances on change
  const handleUpdateBalances = (newBalances: UserBalance) => {
    setBalances(newBalances);
    try {
      localStorage.setItem(BALANCES_STORAGE_KEY, JSON.stringify(newBalances));
    } catch {
      // ignore
    }
  };

  // Add transaction
  const handleAddTransaction = (tx: Transaction) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      try {
        localStorage.setItem(TXS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setTransactions([]);
    try {
      localStorage.removeItem(TXS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Fetch token prices
  const loadPrices = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const { tokens: fetchedTokens, lastUpdated: updatedTime } = await fetchTokenPrices();
      setTokens(fetchedTokens);
      setLastUpdated(updatedTime);
    } catch (err) {
      console.error('Error fetching token prices:', err);
    } finally {
      setIsLoadingTokens(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  // Initial load & 60-second polling
  useEffect(() => {
    loadPrices();
    const interval = setInterval(() => {
      loadPrices();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadPrices]);

  // Calculate total portfolio USD value
  const portfolioUsd = useMemo(() => {
    if (tokens.length === 0) return 0;
    const tokenPriceMap = new Map(tokens.map((t) => [t.symbol, t.price]));
    let total = 0;
    for (const [symbol, amount] of Object.entries(balances)) {
      const price = tokenPriceMap.get(symbol) || 0;
      total += amount * price;
    }
    return total;
  }, [tokens, balances]);

  return (
    <div className="app-container">
      {/* Background Animated Glows & Grid */}
      <div className="background-glow">
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
        <div className="glow-grid" />
      </div>

      {/* Header */}
      <Header
        portfolioUsd={portfolioUsd}
        lastUpdated={lastUpdated}
        onRefreshPrices={() => loadPrices(true)}
        isRefreshing={isRefreshing}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => {}}
        txCount={transactions.length}
      />

      {/* Main Content */}
      <main className="main-content">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Swap Anytime, Anywhere.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '440px', margin: '0 auto' }}>
            Instant cross-token liquidity with verified oracle pricing and sub-second simulation.
          </p>
        </div>

        {/* Swap Form Card */}
        <SwapForm
          tokens={tokens}
          balances={balances}
          onUpdateBalances={handleUpdateBalances}
          onAddTransaction={handleAddTransaction}
          isLoadingTokens={isLoadingTokens}
        />

        {/* Live Token Marquee / Ticker */}
        {tokens.length > 0 && (
          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
              maxWidth: '680px',
            }}
          >
            {tokens.slice(0, 6).map((token) => (
              <div
                key={token.symbol}
                style={{
                  background: 'rgba(19, 24, 35, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{token.symbol}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{formatUsd(token.price)}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={transactions}
        onClearHistory={handleClearHistory}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div>CurrencySwap • Built for 99Tech Frontend Challenge • Powered by Vite & React</div>
      </footer>
    </div>
  );
}

export default App;
