import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, Wallet, CreditCard, PiggyBank, Banknote, TrendingUp, X } from 'lucide-react';
import type { Account } from '../types';

interface AccountsModalProps {
  accounts: Account[];
  onRefresh: () => void;
  onClose: () => void;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({ accounts, onRefresh, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('Checking');
  const [balance, setBalance] = useState('');
  const [color] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);

  const getAccountIcon = (accType: string) => {
    switch (accType) {
      case 'Checking': return <Wallet className="w-5 h-5 text-blue-400" />;
      case 'Savings': return <PiggyBank className="w-5 h-5 text-emerald-400" />;
      case 'Credit Card': return <CreditCard className="w-5 h-5 text-rose-400" />;
      case 'Investment': return <TrendingUp className="w-5 h-5 text-purple-400" />;
      default: return <Banknote className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('accounts').insert([
        {
          user_id: user.id,
          name,
          type,
          balance: parseFloat(balance) || 0.0,
          color,
        },
      ]);
      if (error) throw error;
      setName('');
      setBalance('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" /> Manage Accounts
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 overflow-y-auto">
          {/* Create Form */}
          <form onSubmit={handleCreate} className="space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200">Add New Account</h3>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Account Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chase Checking"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Investment">Investment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Initial Balance ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" /> {loading ? 'Adding...' : 'Add Account'}
            </button>
          </form>

          {/* Accounts List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Your Accounts ({accounts.length})</h3>
            {accounts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No accounts added yet.</p>
            ) : (
              accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{acc.name}</p>
                      <p className="text-xs text-slate-400">{acc.type}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className={`text-sm font-semibold ${acc.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                      ${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
