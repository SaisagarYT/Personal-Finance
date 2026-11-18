import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Account, Category } from '../types';

interface ActionModalsProps {
  accounts: Account[];
  categories: Category[];
  activeModal: 'transfer' | 'request' | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const ActionModals: React.FC<ActionModalsProps> = ({
  accounts,
  categories,
  activeModal,
  onClose,
  onRefresh,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!activeModal) return null;

  const isTransfer = activeModal === 'transfer';
  const type = isTransfer ? 'expense' : 'income';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!accountId || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount and account');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: txErr } = await supabase.from('transactions').insert([
        {
          user_id: user.id,
          account_id: accountId,
          category_id: categoryId || null,
          amount: numAmount,
          type,
          description: description || (isTransfer ? 'Transfer payment' : 'Requested funds'),
          transaction_date: new Date().toISOString().split('T')[0],
        },
      ]);
      if (txErr) throw txErr;

      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        const cur = parseFloat(account.balance as any);
        const newBal = isTransfer ? cur - numAmount : cur + numAmount;
        await supabase.from('accounts').update({ balance: newBal }).eq('id', accountId);
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EFEA]">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isTransfer ? 'bg-[#141414] text-white' : 'bg-[#E74D28] text-white'
              }`}
            >
              {isTransfer ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <h2 className="text-base font-bold text-[#141414]">
              {isTransfer ? 'Transfer Out / Expense' : 'Request Funds / Income'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B6A66] hover:text-[#141414] hover:bg-[#FAFAF7] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-2xl px-4 py-2.5 text-xl font-bold text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3 py-2 text-xs font-medium text-[#141414] focus:outline-none focus:border-[#141414]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${Number(acc.balance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3 py-2 text-xs font-medium text-[#141414] focus:outline-none focus:border-[#141414]"
            >
              <option value="">Select Category (Optional)</option>
              {categories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Payroll transfer, Software license"
              className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3.5 py-2 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              isTransfer ? 'bg-[#141414] hover:bg-[#27272A]' : 'bg-[#E74D28] hover:bg-[#D43E1B]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {loading ? 'Processing...' : isTransfer ? 'Confirm Transfer' : 'Confirm Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
