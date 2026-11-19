import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { USD_TO_INR_RATE, formatCurrencyAmount, type CurrencyCode } from '../lib/currency';
import type { Account, Category } from '../types';

interface ActionModalsProps {
  accounts: Account[];
  categories: Category[];
  activeModal: 'send' | 'receive' | 'transfer' | 'request' | null;
  currency?: CurrencyCode;
  onClose: () => void;
  onRefresh: () => void;
}

export const ActionModals: React.FC<ActionModalsProps> = ({
  accounts,
  categories,
  activeModal,
  currency = 'INR',
  onClose,
  onRefresh,
}) => {
  const [amount, setAmount] = useState('');
  const [modalCurrency, setModalCurrency] = useState<CurrencyCode>(currency);
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync currency and account selection whenever modal opens or accounts load
  useEffect(() => {
    setModalCurrency(currency);
    if (activeModal && accounts.length > 0) {
      if (!accountId || !accounts.some((a) => a.id === accountId)) {
        setAccountId(accounts[0].id);
      }
    }
  }, [currency, activeModal, accounts, accountId]);

  if (!activeModal) return null;

  const isSend = activeModal === 'send' || activeModal === 'transfer';
  const type = isSend ? 'expense' : 'income';

  const effectiveAccountId = accountId || accounts[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = parseFloat(amount);
    if (!effectiveAccountId || isNaN(rawNum) || rawNum <= 0) {
      alert('Please enter a valid amount and account');
      return;
    }

    // Normalize amount to base storage (USD base: if entered in INR, normalize by USD_TO_INR_RATE)
    const numAmount = modalCurrency === 'INR' ? parseFloat((rawNum / USD_TO_INR_RATE).toFixed(2)) : rawNum;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: txErr } = await supabase.from('transactions').insert([
        {
          user_id: user.id,
          account_id: effectiveAccountId,
          category_id: categoryId || null,
          amount: numAmount,
          type,
          description: description || (isSend ? 'Send payment' : 'Received funds'),
          transaction_date: new Date().toISOString().split('T')[0],
        },
      ]);
      if (txErr) throw txErr;

      const account = accounts.find((a) => a.id === effectiveAccountId);
      if (account) {
        const cur = parseFloat(account.balance as any);
        const newBal = isSend ? cur - numAmount : cur + numAmount;
        await supabase.from('accounts').update({ balance: newBal }).eq('id', effectiveAccountId);
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
                isSend ? 'bg-[#141414] text-white' : 'bg-[#E74D28] text-white'
              }`}
            >
              {isSend ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
            </div>
            <h2 className="text-base font-bold text-[#141414]">
              {isSend ? 'Send Money / Expense' : 'Receive Money / Income'}
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#6B6A66]">Amount</label>
              <span className="text-[10px] text-[#9E9D97]">Select currency</span>
            </div>
            <div className="flex items-center gap-2">
              <CurrencySelector
                value={modalCurrency}
                onChange={setModalCurrency}
                variant="input-addon"
              />
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9E9D97]">
                  {modalCurrency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl text-lg font-bold text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Account</label>
            <select
              value={effectiveAccountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3 py-2 text-xs font-medium text-[#141414] focus:outline-none focus:border-[#141414]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrencyAmount(Number(acc.balance), modalCurrency, false)})
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
              placeholder={isSend ? "e.g. Payroll transfer, Software license, Rent" : "e.g. Freelance invoice, Client payment, Salary"}
              className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3.5 py-2 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              isSend ? 'bg-[#141414] hover:bg-[#27272A]' : 'bg-[#E74D28] hover:bg-[#D43E1B]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {loading ? 'Processing...' : isSend ? 'Confirm Send' : 'Confirm Receive'}
          </button>
        </form>
      </div>
    </div>
  );
};
