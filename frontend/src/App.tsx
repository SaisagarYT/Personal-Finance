import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthModal } from './components/AuthModal';
import { AccountsModal } from './components/AccountsModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import type { Account, Category, Transaction } from './types';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Plus,
  Trash2,
  LogOut,
  PieChart as PieChartIcon,
  Layers,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!session?.user) return;

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
      .limit(50);
    if (txData) setTransactions(txData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <AuthModal onSuccess={() => setLoading(false)} />;
  }

  const totalNetWorth = accounts.reduce((sum, a) => sum + parseFloat(a.balance as any || 0), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter((t) => t.transaction_date.startsWith(currentMonth));

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount as any), 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount as any), 0);

  const categorySpendingMap: { [key: string]: number } = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const name = t.categories?.name || 'Uncategorized';
      categorySpendingMap[name] = (categorySpendingMap[name] || 0) + parseFloat(t.amount as any);
    });

  const chartData = Object.entries(categorySpendingMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">PersonalFinance</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-slate-400">Overview of your cashflow and accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAccountsModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-400" /> Accounts ({accounts.length})
            </button>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Net Worth</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-3">
              ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">{accounts.length} active accounts</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Monthly Income</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mt-3">
              +${monthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Monthly Expenses</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-400 mt-3">
              -${monthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Savings: ${(monthIncome - monthExpenses).toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-blue-400" /> Spending by Category
            </h2>
            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic py-12">
                No expense data recorded.
              </div>
            ) : (
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
              <span className="text-xs text-slate-500">{transactions.length} records</span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 italic">
                No transactions yet. Click "+ Add Transaction" to log one.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {transactions.slice(0, 10).map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          t.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {t.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {t.description || t.categories?.name || 'General Transaction'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {t.accounts?.name || 'Account'} • {t.transaction_date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-semibold ${
                          t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}$
                        {Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() =>
                          handleDeleteTransaction(t.id, t.account_id, Number(t.amount), t.type)
                        }
                        className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showAccountsModal && (
        <AccountsModal
          accounts={accounts}
          onRefresh={fetchData}
          onClose={() => setShowAccountsModal(false)}
        />
      )}

      {showTransactionModal && (
        <AddTransactionModal
          accounts={accounts}
          categories={categories}
          onRefresh={fetchData}
          onClose={() => setShowTransactionModal(false)}
        />
      )}
    </div>
  );
}

export default App;
