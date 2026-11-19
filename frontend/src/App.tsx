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
import { formatCurrencyAmount, type CurrencyCode } from './lib/currency';
import type { Account, Category, Transaction } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [activeModal, setActiveModal] = useState<'transfer' | 'request' | null>(null);

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
      // 1. Fetch Accounts
      const { data: accData } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (accData) setAccounts(accData);

      // 2. Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (catData) setCategories(catData);

      // 3. Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts ( name, type, color ),
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
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;

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

  // Dynamic calculations with Indian Rupees (INR) and US Dollar (USD) conversion
  const rawBalance = accounts.length > 0
    ? accounts.reduce((sum, a) => sum + parseFloat(a.balance as any || 0), 0)
    : 22678.00;
  const totalBalanceFormatted = formatCurrencyAmount(rawBalance, currency, true);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter((t) => t.transaction_date.startsWith(currentMonth));

  const monthIncomeRaw = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount as any), 0);
  const effectiveIncome = monthIncomeRaw > 0 ? monthIncomeRaw : 1050;

  const monthExpensesRaw = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount as any), 0);
  const effectiveExpenses = monthExpensesRaw > 0 ? monthExpensesRaw : 700;

  const earningsFormatted = formatCurrencyAmount(effectiveIncome * 0.9, currency, true);
  const spendingFormatted = formatCurrencyAmount(effectiveExpenses, currency, true);
  const incomeFormatted = formatCurrencyAmount(effectiveIncome, currency, true);
  const revenueFormatted = formatCurrencyAmount(effectiveIncome * 0.8, currency, true);

  const walletsData = accounts.length > 0
    ? accounts.slice(0, 3).map((acc) => ({
        currency: currency,
        symbol: currency === 'INR' ? '₹' : '$',
        balance: formatCurrencyAmount(Number(acc.balance), currency, true),
        limit: `Limit ${currency === 'INR' ? '₹10L' : '$10k'} / mo`,
        status: (acc.balance >= 0 ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
      }))
    : undefined;

  const currentSpentOfLimit = formatCurrencyAmount(effectiveExpenses * 2, currency, true);
  const totalLimitFormatted = formatCurrencyAmount(5500, currency, true);
  const spentPercent = Math.min(Math.round(((effectiveExpenses * 2) / 5500) * 100) || 26, 100);

  const currentUserName = session?.user?.user_metadata?.full_name || 'Amara Okello';
  const currentUserEmail = session?.user?.email || 'amara@kova.app';

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
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  wallets={walletsData}
                  onTransfer={() => setActiveModal('transfer')}
                  onRequest={() => setActiveModal('request')}
                />
                <RecentActivitiesTable
                  transactions={transactions.length > 0 ? transactions : undefined}
                  currency={currency}
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
                />
                <IncomeChartWithLimitCard
                  spentAmount={currentSpentOfLimit}
                  totalLimit={totalLimitFormatted}
                  spentPercentage={spentPercent}
                />
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ACTIVITY (Full Transaction Ledger & Filters) */}
        {activeTab === 'Activity' && (
          <ActivityView
            transactions={transactions}
            currency={currency}
            onCurrencyChange={setCurrency}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenTransfer={() => setActiveModal('transfer')}
            onOpenRequest={() => setActiveModal('request')}
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
      />
    </div>
  );
}

export default App;
