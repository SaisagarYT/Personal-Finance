import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, ArrowDownLeft, ArrowUpRight, ChevronDown, Check, Wallet, Tag } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { formatCurrencyAmount, convertCurrency, getCurrencySymbol, type CurrencyCode } from '../lib/currency';
import type { Account, Category } from '../types';

interface ActionModalsProps {
  accounts: Account[];
  categories: Category[];
  activeModal: 'send' | 'receive' | 'transfer' | 'request' | null;
  currency?: CurrencyCode;
  onClose: () => void;
  onRefresh: () => void;
  onNavigateToAccount?: () => void;
}

export const ActionModals: React.FC<ActionModalsProps> = ({
  accounts,
  categories,
  activeModal,
  currency = 'INR',
  onClose,
  onRefresh,
  onNavigateToAccount,
}) => {
  const [amount, setAmount] = useState('');
  const [modalCurrency, setModalCurrency] = useState<CurrencyCode>(currency);
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom dropdown open states
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Sync currency and account selection whenever modal opens or accounts load
  useEffect(() => {
    setModalCurrency(currency);
    if (activeModal && accounts.length > 0) {
      if (!accountId || !accounts.some((a) => a.id === accountId)) {
        setAccountId(accounts[0].id);
      }
    }
  }, [currency, activeModal, accounts, accountId]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeModal) return null;

  const isSend = activeModal === 'send' || activeModal === 'transfer';
  const type = isSend ? 'expense' : 'income';

  const effectiveAccountId = accountId || accounts[0]?.id || '';
  const selectedAccount = accounts.find((a) => a.id === effectiveAccountId);
  const selectedAccountCurrency = (selectedAccount?.currency || 'INR').toUpperCase() as CurrencyCode;
  const selectedCategory = categories.find((c) => c.id === categoryId);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const convertedInAccountCurrency = isAmountValid && modalCurrency !== selectedAccountCurrency
    ? convertCurrency(parsedAmount, modalCurrency, selectedAccountCurrency)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = parseFloat(amount);
    if (!effectiveAccountId || isNaN(rawNum) || rawNum <= 0) {
      alert('Please enter a valid amount and select an account');
      return;
    }

    const targetAccount = accounts.find((a) => a.id === effectiveAccountId);
    const accountCurrency = (targetAccount?.currency || 'INR').toUpperCase() as CurrencyCode;

    // Convert entered amount from modal's selected currency to target account's native currency
    const amountInAccountCurrency = convertCurrency(rawNum, modalCurrency, accountCurrency);
    const numAmount = parseFloat(amountInAccountCurrency.toFixed(2));

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

      if (targetAccount) {
        const cur = parseFloat(targetAccount.balance as any);
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
        {/* Header */}
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

        {/* Empty Accounts State */}
        {accounts.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAFAF7] border border-[#EAE9E4] flex items-center justify-center mx-auto text-[#6B6A66]">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#141414]">No Active Wallets Found</h3>
            <p className="text-xs text-[#6B6A66] max-w-xs mx-auto leading-relaxed">
              You need at least one linked wallet or bank account to {isSend ? 'send payments from' : 'receive deposits into'}.
              Head to the <strong>Account</strong> tab to create your first wallet.
            </p>
            <button
              type="button"
              onClick={() => {
                if (onNavigateToAccount) {
                  onNavigateToAccount();
                } else {
                  onClose();
                }
              }}
              className="mt-3 px-5 py-2.5 bg-[#141414] hover:bg-[#27272A] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
            >
              Go to Account Settings & Add Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {/* Amount Field with Currency Selector */}
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
                    {getCurrencySymbol(modalCurrency)}
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
              {convertedInAccountCurrency !== null && selectedAccount && (
                <div className="mt-2 px-3 py-1.5 bg-[#F6F5F0] border border-[#EBEAE3] rounded-xl text-[11px] text-[#6B6A66] flex items-center justify-between">
                  <span>Equivalent in {selectedAccount.name} ({selectedAccountCurrency}):</span>
                  <span className="font-bold text-[#141414]">
                    {formatCurrencyAmount(convertedInAccountCurrency, selectedAccountCurrency, selectedAccountCurrency)}
                  </span>
                </div>
              )}
            </div>

            {/* Custom Account / Wallet Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <label className="block text-xs font-semibold text-[#6B6A66] mb-1">
                {isSend ? 'Payment Wallet / Source Account' : 'Deposit Destination Wallet'}
              </label>
              <button
                type="button"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="w-full bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#EAE9E4] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#141414] focus:outline-none focus:border-[#141414] flex items-center justify-between transition cursor-pointer text-left"
              >
                {selectedAccount ? (
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {getCurrencySymbol(selectedAccountCurrency)}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#141414]">{selectedAccount.name}</span>
                        <span className="text-[10px] text-[#9E9D97] px-1.5 py-0.5 bg-[#EAE9E4] rounded-md font-mono">
                          {selectedAccount.type} •••• {selectedAccount.id.slice(-4).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B6A66]">
                        Available: {formatCurrencyAmount(Number(selectedAccount.balance), selectedAccountCurrency, selectedAccountCurrency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[#9E9D97]">Select wallet</span>
                )}
                <ChevronDown className={`w-4 h-4 text-[#6B6A66] transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAccountOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl shadow-xl py-1 z-50 max-h-56 overflow-y-auto">
                  {accounts.map((acc) => {
                    const accCurr = (acc.currency || 'INR').toUpperCase() as CurrencyCode;
                    const nativeBal = formatCurrencyAmount(Number(acc.balance), accCurr, accCurr);
                    const convertedBal = modalCurrency !== accCurr
                      ? ` · ≈ ${formatCurrencyAmount(Number(acc.balance), modalCurrency, accCurr)}`
                      : '';
                    const isSelected = acc.id === effectiveAccountId;

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setAccountId(acc.id);
                          setIsAccountOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left hover:bg-[#FAFAF7] transition flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-[#FAFAF7]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#141414] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {getCurrencySymbol(accCurr)}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#141414]">{acc.name}</span>
                              <span className="text-[10px] text-[#9E9D97] px-1.5 py-0.5 bg-[#F3F2ED] rounded-md font-mono">
                                {acc.type} •••• {acc.id.slice(-4).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6B6A66] mt-0.5">
                              Available: <span className="font-semibold text-[#141414]">{nativeBal}</span>
                              {convertedBal && <span className="text-[#E74D28] font-medium">{convertedBal}</span>}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#141414]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Category Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Category</label>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#EAE9E4] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#141414] focus:outline-none focus:border-[#141414] flex items-center justify-between transition cursor-pointer text-left"
              >
                {selectedCategory ? (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#E74D28]" />
                    <span className="font-semibold text-[#141414]">{selectedCategory.name}</span>
                  </div>
                ) : (
                  <span className="text-[#9E9D97]">Select Category (Optional)</span>
                )}
                <ChevronDown className={`w-4 h-4 text-[#6B6A66] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl shadow-xl py-1 z-50 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId('');
                      setIsCategoryOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-[#9E9D97] hover:bg-[#FAFAF7] transition cursor-pointer"
                  >
                    None (No category)
                  </button>
                  {categories
                    .filter((c) => c.type === type)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(c.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-[#FAFAF7] transition flex items-center justify-between cursor-pointer ${
                          c.id === categoryId ? 'bg-[#FAFAF7] text-[#141414]' : 'text-[#6B6A66]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-[#E74D28]" />
                          <span>{c.name}</span>
                        </div>
                        {c.id === categoryId && <Check className="w-3.5 h-3.5 text-[#141414]" />}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Description Field */}
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

            {/* Submit Button */}
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
        )}
      </div>
    </div>
  );
};
