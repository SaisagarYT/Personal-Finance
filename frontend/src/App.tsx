import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { IncomeChartWithLimitCard } from './components/IncomeChartWithLimitCard';
import { RecentActivitiesTable } from './components/RecentActivitiesTable';
import { ActivityView } from './components/ActivityView';
import { AccountSettingsView } from './components/AccountSettingsView';
import { ActionModals } from './components/ActionModals';
import { AuthView } from './components/AuthView';
import { backendApi } from './lib/api';
import { formatCurrencyAmount, convertCurrency, getCurrencySymbol, type CurrencyCode } from './lib/currency';
import type { Account, Category, Transaction } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [activeModal, setActiveModal] = useState<'send' | 'receive' | 'transfer' | 'request' | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!session?.user || !isSupabaseConfigured) return;

    try {
      // 1. Primary path: query via deployed Cloudflare Workers backend API
      try {
        const [accData, catData, txData] = await Promise.all([
          backendApi.getAccounts(),
          backendApi.getCategories(),
          backendApi.getTransactions(),
        ]);
        if (accData && Array.isArray(accData)) setAccounts(accData);
        if (catData && Array.isArray(catData)) setCategories(catData);
        if (txData && Array.isArray(txData)) {
          setTransactions(txData);
          return;
        }
      } catch (backendErr) {
        // Fallback to direct client
      }

      // 2. Direct Supabase client query
      const { data: accData } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (accData) setAccounts(accData);

      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (catData) setCategories(catData);

      const { data: txData } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts ( id, name, type, color, currency ),
          categories ( name, icon, color )
        `)
        .order('transaction_date', { ascending: false })
        .limit(50);
      if (txData) setTransactions(txData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const handleDeleteTransaction = async (id: string, accountId: string, amount: number, type: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      try {
        await backendApi.deleteTransaction(id);
      } catch (e) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
      }

      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        const cur = parseFloat(account.balance as any);
        const reverted = type === 'income' ? cur - amount : cur + amount;
        await supabase.from('accounts').update({ balance: reverted }).eq('id', accountId);
      }

      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F2ED] flex items-center justify-center text-xs font-semibold text-[#6B6A66]">
        Loading Kova...
      </div>
    );
  }

  // If user is not authenticated, show fullscreen AuthView
  if (!session?.user) {
    return <AuthView onAuthSuccess={() => setAuthLoading(false)} />;
  }

  // Real dynamic calculations from Supabase database
  // Convert each account balance from its native currency into the selected display currency
  const rawBalance = accounts.reduce((sum, a) => {
    const bal = parseFloat(a.balance as any || 0);
    const accCurrency = (a.currency || 'INR').toUpperCase();
    return sum + convertCurrency(bal, accCurrency, currency);
  }, 0);
  const totalBalanceFormatted = formatCurrencyAmount(rawBalance, currency, currency);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter((t) => t.transaction_date.startsWith(currentMonth));

  const getTxCurrency = (t: Transaction): CurrencyCode => {
    if (t.accounts?.currency) return t.accounts.currency.toUpperCase() as CurrencyCode;
    const acc = accounts.find((a) => a.id === t.account_id);
    if (acc?.currency) return acc.currency.toUpperCase() as CurrencyCode;
    return 'INR';
  };

  const monthIncomeRaw = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => {
      const amt = parseFloat(t.amount as any || 0);
      const accCurrency = getTxCurrency(t);
      return sum + convertCurrency(amt, accCurrency, currency);
    }, 0);

  const monthExpensesRaw = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => {
      const amt = parseFloat(t.amount as any || 0);
      const accCurrency = getTxCurrency(t);
      return sum + convertCurrency(amt, accCurrency, currency);
    }, 0);

  const netRevenue = monthIncomeRaw - monthExpensesRaw;

  const earningsFormatted = formatCurrencyAmount(monthIncomeRaw, currency, currency);
  const spendingFormatted = formatCurrencyAmount(monthExpensesRaw, currency, currency);
  const incomeFormatted = formatCurrencyAmount(monthIncomeRaw, currency, currency);
  const revenueFormatted = formatCurrencyAmount(netRevenue, currency, currency);

  const incomeCount = monthTransactions.filter((t) => t.type === 'income').length;
  const expenseCount = monthTransactions.filter((t) => t.type === 'expense').length;

  const walletsData = accounts.slice(0, 3).map((acc) => {
    const nativeBal = Number(acc.balance);
    const accCurrency = (acc.currency || 'INR').toUpperCase() as CurrencyCode;
    return {
      name: acc.name,
      currency: accCurrency,
      symbol: getCurrencySymbol(accCurrency),
      balance: formatCurrencyAmount(nativeBal, accCurrency, accCurrency),
      convertedBalance: accCurrency !== currency ? `≈ ${formatCurrencyAmount(nativeBal, currency, accCurrency)}` : undefined,
      limit: `Limit ${accCurrency === 'INR' ? '₹10L' : '$10k'} / mo`,
      status: (nativeBal >= 0 ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
    };
  });

  // Budget calculations derived from real activity
  const monthlyBudgetLimitNumber = rawBalance > 0
    ? Math.max(rawBalance * 0.4, currency === 'INR' ? 50000 : 600)
    : (currency === 'INR' ? 50000 : 600);
  const currentSpentOfLimit = formatCurrencyAmount(monthExpensesRaw, currency, currency);
  const totalLimitFormatted = formatCurrencyAmount(monthlyBudgetLimitNumber, currency, currency);
  const spentPercent = monthlyBudgetLimitNumber > 0
    ? Math.min(Math.round((monthExpensesRaw / monthlyBudgetLimitNumber) * 100), 100)
    : 0;

  // Dynamically compute the last 6 months of Profit & Loss for the chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const pastMonths: { key: string; month: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    pastMonths.push({ key, month: monthNames[d.getMonth()] });
  }

  const chartData = pastMonths.map(({ key, month }) => {
    const txsInMonth = transactions.filter((t) => t.transaction_date.startsWith(key));
    const profitRaw = txsInMonth
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + convertCurrency(parseFloat(t.amount as any || 0), getTxCurrency(t), currency), 0);
    const lossRaw = txsInMonth
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + convertCurrency(parseFloat(t.amount as any || 0), getTxCurrency(t), currency), 0);

    return {
      month,
      profit: profitRaw,
      loss: lossRaw,
      total: profitRaw + lossRaw,
      profitFormatted: formatCurrencyAmount(profitRaw, currency, currency),
      lossFormatted: formatCurrencyAmount(lossRaw, currency, currency),
    };
  });

  // Real user identity from authenticated Supabase session
  const currentUserName = session?.user?.user_metadata?.full_name ||
                          (session?.user?.email ? session.user.email.split('@')[0] : 'My Account');
  const currentUserEmail = session?.user?.email || '';

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-[#141414] flex flex-col font-sans antialiased pb-12">
      {/* 1. Header Navigation Bar with Tab Switcher & Global Currency Dropdown */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={currentUserName}
        userEmail={currentUserEmail}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Content View Switcher */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* TAB 1: OVERVIEW (Main Dashboard) */}
        {activeTab === 'Overview' && (
          <>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
                Good morning, {currentUserName.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-[#6B6A66] mt-1">
                Here's where your money stands today — balances, cash flow and recent activity.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (7 of 12) */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                <TotalBalanceCard
                  balance={totalBalanceFormatted}
                  sentAmount={spendingFormatted}
                  receivedAmount={earningsFormatted}
                  expenseCount={expenseCount}
                  incomeCount={incomeCount}
                  trendPercentage={netRevenue >= 0 ? '+12.8%' : '-4.2%'}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  wallets={walletsData}
                  onSend={() => setActiveModal('send')}
                  onReceive={() => setActiveModal('receive')}
                />
                <RecentActivitiesTable
                  transactions={transactions}
                  accounts={accounts}
                  currency={currency}
                  onViewAll={() => setActiveTab('Activity')}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>

              {/* Right Column (5 of 12) */}
              <div className="lg:col-span-5 flex flex-col space-y-6">
                <MetricCardsGrid
                  earnings={earningsFormatted}
                  spending={spendingFormatted}
                  income={incomeFormatted}
                  revenue={revenueFormatted}
                  incomeCount={incomeCount}
                  expenseCount={expenseCount}
                />
                <IncomeChartWithLimitCard
                  spentAmount={currentSpentOfLimit}
                  totalLimit={totalLimitFormatted}
                  spentPercentage={spentPercent}
                  chartData={chartData}
                  currency={currency}
                />
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ACTIVITY (Full Transaction Ledger & Filters) */}
        {activeTab === 'Activity' && (
          <ActivityView
            transactions={transactions}
            accounts={accounts}
            currency={currency}
            onCurrencyChange={setCurrency}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenSend={() => setActiveModal('send')}
            onOpenReceive={() => setActiveModal('receive')}
          />
        )}

        {/* TAB 3: ACCOUNT (User Profile & Wallets Management) */}
        {activeTab === 'Account' && (
          <AccountSettingsView
            accounts={accounts}
            userName={currentUserName}
            userEmail={currentUserEmail}
            currency={currency}
            onCurrencyChange={setCurrency}
            onRefresh={fetchData}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Action Modals with Currency Dropdown */}
      <ActionModals
        accounts={accounts}
        categories={categories}
        activeModal={activeModal}
        currency={currency}
        onClose={() => setActiveModal(null)}
        onRefresh={fetchData}
        onNavigateToAccount={() => {
          setActiveModal(null);
          setActiveTab('Account');
        }}
      />
    </div>
  );
}

export default App;
