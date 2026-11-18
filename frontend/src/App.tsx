import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { IncomeChartCard } from './components/IncomeChartCard';
import { SpendingLimitCard } from './components/SpendingLimitCard';
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

  // Calculations
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

        {/* Master Asymmetric Grid: Left Main (8 cols) + Right Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT MAIN COLUMN (8 of 12) ================= */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            {/* Top Row: Total Balance (50%) + 2x2 Metric Cards (50%) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              <TotalBalanceCard
                balance={totalBalanceFormatted}
                wallets={walletsData}
                onTransfer={() => setActiveModal('transfer')}
                onRequest={() => setActiveModal('request')}
              />
              <MetricCardsGrid
                earnings={earningsFormatted}
                spending={spendingFormatted}
                income={incomeFormatted}
                revenue={revenueFormatted}
              />
            </div>

            {/* Bottom Row: Full-Width Recent Activities Table */}
            <RecentActivitiesTable
              transactions={transactions.length > 0 ? transactions : undefined}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>

          {/* ================= RIGHT SIDEBAR COLUMN (4 of 12) ================= */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* 1. Total Income Profit & Loss Bar Chart Card */}
            <IncomeChartCard />

            {/* 2. Monthly Spending Limit Progress Card */}
            <SpendingLimitCard
              spentAmount={currentSpentOfLimit}
              totalLimit="$5,500.00"
              spentPercentage={spentPercent}
            />
          </div>
        </div>
      </main>

      {/* Action Modals for Transfer & Request */}
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
