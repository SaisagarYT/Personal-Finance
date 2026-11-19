import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { IncomeChartWithLimitCard } from './components/IncomeChartWithLimitCard';
import { RecentActivitiesTable } from './components/RecentActivitiesTable';
import { ActivityView } from './components/ActivityView';
import { ReportsView } from './components/ReportsView';
import { AccountSettingsView } from './components/AccountSettingsView';
import { ActionModals } from './components/ActionModals';
import { AuthView } from './components/AuthView';
import type { Account, Category, Transaction } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('Overview');
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

  // Dynamic calculations
  const totalBalanceNumber = accounts.reduce((sum, a) => sum + parseFloat(a.balance as any || 0), 0);
  const totalBalanceFormatted = accounts.length > 0
    ? `$${totalBalanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : '$689,372.00';

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter((t) => t.transaction_date.startsWith(currentMonth));

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount as any), 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount as any), 0);

  const earningsFormatted = monthIncome > 0 ? `$${monthIncome.toLocaleString('en-US')}` : '$950';
  const spendingFormatted = monthExpenses > 0 ? `$${monthExpenses.toLocaleString('en-US')}` : '$700';
  const incomeFormatted = monthIncome > 0 ? `$${monthIncome.toLocaleString('en-US')}` : '$1,050';
  const revenueFormatted = monthIncome > 0 ? `$${(monthIncome * 0.8).toFixed(0)}` : '$850';

  const walletsData = accounts.length > 0
    ? accounts.slice(0, 3).map((acc) => ({
        currency: acc.currency || 'USD',
        symbol: acc.currency === 'EUR' ? '€' : acc.currency === 'GBP' ? '£' : '$',
        balance: `$${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        limit: `Limit $10k / mo`,
        status: (acc.balance >= 0 ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
      }))
    : undefined;

  const currentSpentOfLimit = monthExpenses > 0 ? `$${monthExpenses.toFixed(2)}` : '$1,400.00';
  const spentPercent = Math.min(Math.round((monthExpenses / 5500) * 100) || 26, 100);

  const currentUserName = session?.user?.user_metadata?.full_name || 'Amara Okello';
  const currentUserEmail = session?.user?.email || 'amara@kova.app';

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-[#141414] flex flex-col font-sans antialiased pb-12">
      {/* 1. Header Navigation Bar with Tab Switcher */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={currentUserName}
        userEmail={currentUserEmail}
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
                  wallets={walletsData}
                  onTransfer={() => setActiveModal('transfer')}
                  onRequest={() => setActiveModal('request')}
                />
                <RecentActivitiesTable
                  transactions={transactions.length > 0 ? transactions : undefined}
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
                  totalLimit="$5,500.00"
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
            onDeleteTransaction={handleDeleteTransaction}
            onOpenTransfer={() => setActiveModal('transfer')}
            onOpenRequest={() => setActiveModal('request')}
          />
        )}

        {/* TAB 3: REPORTS (Visual Analytics Summary) */}
        {activeTab === 'Reports' && (
          <ReportsView
            transactions={transactions}
            accounts={accounts}
          />
        )}

        {/* TAB 4: ACCOUNT (User Profile & Wallets Management) */}
        {activeTab === 'Account' && (
          <AccountSettingsView
            accounts={accounts}
            userName={currentUserName}
            userEmail={currentUserEmail}
            onRefresh={fetchData}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Action Modals */}
      <ActionModals
        accounts={accounts}
        categories={categories}
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onRefresh={fetchData}
      />
    </div>
  );
}

export default App;
