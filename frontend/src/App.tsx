import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { IncomeChartWithLimitCard } from './components/IncomeChartWithLimitCard';
import { RecentActivitiesTable } from './components/RecentActivitiesTable';
import { ActionModals } from './components/ActionModals';
import type { Account, Category, Transaction } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [session, setSession] = useState<any>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [activeModal, setActiveModal] = useState<'transfer' | 'request' | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!isSupabaseConfigured) return;

    try {
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
          accounts ( name, type, color ),
          categories ( name, icon, color )
        `)
        .order('transaction_date', { ascending: false })
        .limit(20);
      if (txData) setTransactions(txData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
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

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-[#141414] flex flex-col font-sans antialiased pb-12">
      {/* 1. Header Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={session?.user?.user_metadata?.full_name || 'Amara Okello'}
        userEmail={session?.user?.email || 'amara@kova.app'}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Welcome Section Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
            Good morning, {session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Amara'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6A66] mt-1">
            Here's where your money stands today — balances, cash flow and recent activity.
          </p>
        </div>

        {/* Master 60/40 Asymmetric 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT WIDER COLUMN (~58-60%, 7 of 12 cols) ================= */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            {/* 1. Total Balance Card */}
            <TotalBalanceCard
              balance={totalBalanceFormatted}
              wallets={walletsData}
              onTransfer={() => setActiveModal('transfer')}
              onRequest={() => setActiveModal('request')}
            />

            {/* 2. Recent Activities Table (Directly below Total Balance) */}
            <RecentActivitiesTable
              transactions={transactions.length > 0 ? transactions : undefined}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>

          {/* ================= RIGHT COMPACT COLUMN (~40-42%, 5 of 12 cols) ================= */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* 1. 2x2 Metric Cards Grid (Total earnings, spending, income, revenue) */}
            <MetricCardsGrid
              earnings={earningsFormatted}
              spending={spendingFormatted}
              income={incomeFormatted}
              revenue={revenueFormatted}
            />

            {/* 2. Total Income Profit & Loss Chart + Monthly Spending Limit (Directly below 2x2 cards) */}
            <IncomeChartWithLimitCard
              spentAmount={currentSpentOfLimit}
              totalLimit="$5,500.00"
              spentPercentage={spentPercent}
            />
          </div>
        </div>
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
