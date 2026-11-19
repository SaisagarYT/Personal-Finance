import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Wallet, Trash2, Shield, LogOut } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { type CurrencyCode, formatCurrencyAmount, getCurrencySymbol } from '../lib/currency';
import type { Account } from '../types';

interface AccountSettingsViewProps {
  accounts: Account[];
  userName: string;
  userEmail: string;
  currency?: CurrencyCode;
  onCurrencyChange?: (c: CurrencyCode) => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  accounts,
  userName,
  userEmail,
  currency = 'INR',
  onCurrencyChange,
  onRefresh,
  onSignOut,
}) => {
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('Checking');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccCurrency, setNewAccCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('accounts').insert([
        {
          user_id: user.id,
          name: newAccName,
          type: newAccType,
          balance: parseFloat(newAccBalance) || 0.0,
          currency: newAccCurrency,
          color: '#141414',
        },
      ]);
      if (error) throw error;

      setNewAccName('');
      setNewAccBalance('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? Associated transactions will also be affected.')) return;
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
            Account & Wallets Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6A66] mt-1">
            Manage your personal profile, linked wallets, and currency preferences.
          </p>
        </div>

        {onCurrencyChange && (
          <CurrencySelector value={currency} onChange={onCurrencyChange} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 of 12): Profile Card */}
        <div className="md:col-span-5 space-y-6">
          {/* User Profile Card */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#141414] text-white text-xl font-bold flex items-center justify-center mx-auto shadow-sm">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-[#141414] mt-3">{userName}</h2>
            <p className="text-xs text-[#6B6A66]">{userEmail}</p>

            <div className="mt-6 pt-5 border-t border-[#F0EFEA] flex items-center justify-around text-xs">
              <div>
                <p className="font-extrabold text-[#141414] text-base">{accounts.length}</p>
                <p className="text-[#9E9D97] text-[11px]">Accounts</p>
              </div>
              <div className="w-[1px] h-8 bg-[#F0EFEA]" />
              <div>
                <p className="font-extrabold text-[#141414] text-base flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Active
                </p>
                <p className="text-[#9E9D97] text-[11px]">Cloud Synced</p>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full mt-6 py-2.5 px-4 bg-[#FAFAF7] hover:bg-[#F3F2ED] hover:border-[#141414] hover:text-[#E74D28] border border-[#E7E6DF] rounded-full text-xs font-semibold text-[#141414] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="bg-[#FAFAF7] border border-[#EAE9E4] rounded-[24px] p-5 text-xs text-[#6B6A66] space-y-2">
            <div className="flex items-center gap-2 text-[#141414] font-semibold">
              <Shield className="w-4 h-4 text-[#E74D28]" />
              <span>Security & Encryption</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#9E9D97]">
              All data is secured with Supabase Row-Level Security (RLS). Only your authenticated session can query or modify these wallets.
            </p>
          </div>
        </div>

        {/* Right Column (7 of 12): Manage Wallets & Create New */}
        <div className="md:col-span-7 space-y-6">
          {/* Create New Account Form */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm">
            <h2 className="text-base font-bold text-[#141414] tracking-tight mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#E74D28]" /> Create New Wallet / Account
            </h2>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="e.g. Daily Checking, Savings"
                    className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3.5 py-2 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3 py-2 text-xs font-medium text-[#141414] focus:outline-none focus:border-[#141414]"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Investment">Investment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6A66] mb-1">
                    Starting Balance ({getCurrencySymbol(newAccCurrency)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3.5 py-2 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B6A66] mb-1">Currency</label>
                  <select
                    value={newAccCurrency}
                    onChange={(e) => setNewAccCurrency(e.target.value)}
                    className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3 py-2 text-xs font-medium text-[#141414] focus:outline-none focus:border-[#141414]"
                  >
                    <option value="INR">INR (₹) - India</option>
                    <option value="USD">USD ($) - United States</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#141414] hover:bg-[#27272A] text-white text-xs font-semibold rounded-full shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                {loading ? 'Creating...' : 'Add Account'}
              </button>
            </form>
          </div>

          {/* Existing Accounts List */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm">
            <h2 className="text-base font-bold text-[#141414] tracking-tight mb-4">
              Your Active Wallets ({accounts.length})
            </h2>

            {accounts.length === 0 ? (
              <p className="text-xs text-[#9E9D97] italic py-4">No custom accounts created yet.</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => {
                  const accCurr = (acc.currency || 'INR').toUpperCase();
                  const symbol = getCurrencySymbol(accCurr);
                  const nativeBal = formatCurrencyAmount(Number(acc.balance), accCurr as CurrencyCode, accCurr as CurrencyCode);
                  const isConverted = currency !== accCurr;
                  const convertedBal = isConverted ? formatCurrencyAmount(Number(acc.balance), currency, accCurr as CurrencyCode) : null;

                  return (
                    <div
                      key={acc.id}
                      className="bg-[#FAFAF7] border border-[#EAE9E4] rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#141414] text-white text-xs font-bold flex items-center justify-center">
                          {symbol}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#141414]">{acc.name}</p>
                          <p className="text-[10px] text-[#9E9D97]">{acc.type} • {accCurr}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#141414]">
                            {nativeBal}
                          </p>
                          {convertedBal && (
                            <p className="text-[10px] font-semibold text-[#E74D28]" title="Converted to selected display currency">
                              ≈ {convertedBal}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-1.5 text-[#9E9D97] hover:text-[#E74D28] transition cursor-pointer"
                          title="Delete account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
