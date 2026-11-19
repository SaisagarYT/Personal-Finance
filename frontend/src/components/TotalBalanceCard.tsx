import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet as WalletIcon } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { getAmountFontSize } from '../lib/dynamicSize';
import type { CurrencyCode } from '../lib/currency';

interface Wallet {
  currency: string;
  symbol: string;
  balance: string;
  limit: string;
  status: 'Active' | 'Inactive';
}

interface TotalBalanceCardProps {
  balance?: string;
  sentAmount?: string;
  receivedAmount?: string;
  expenseCount?: number;
  incomeCount?: number;
  currency?: CurrencyCode;
  onCurrencyChange?: (c: CurrencyCode) => void;
  trendPercentage?: string;
  wallets?: Wallet[];
  onSend?: () => void;
  onReceive?: () => void;
  onTransfer?: () => void;
  onRequest?: () => void;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  balance = '₹0.00',
  sentAmount = '₹0.00',
  receivedAmount = '₹0.00',
  expenseCount = 0,
  incomeCount = 0,
  currency = 'INR',
  onCurrencyChange,
  trendPercentage = '+12.5%',
  wallets = [],
  onSend,
  onReceive,
  onTransfer,
  onRequest,
}) => {
  const [viewMode, setViewMode] = useState<'total' | 'send' | 'receive'>('total');

  const handleSend = onSend || onTransfer;
  const handleReceive = onReceive || onRequest;

  // Determine current active display amount and label based on tab
  const displayAmount =
    viewMode === 'send'
      ? `-${sentAmount.replace(/^[+-]/, '')}`
      : viewMode === 'receive'
      ? `+${receivedAmount.replace(/^[+-]/, '')}`
      : balance;

  const displayLabel =
    viewMode === 'send'
      ? 'Monthly Outflow (Sent)'
      : viewMode === 'receive'
      ? 'Monthly Inflow (Received)'
      : 'Total Net Balance';

  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Header: Label, Mode Switcher, and Currency Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 3-Way Segmented View Switcher: Total | Send | Receive */}
          <div className="flex items-center gap-1 p-1 bg-[#F3F2ED] rounded-full border border-[#E7E6DF]">
            <button
              type="button"
              onClick={() => setViewMode('total')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#6B6A66] hover:text-[#141414]'
              }`}
            >
              Total
            </button>
            <button
              type="button"
              onClick={() => setViewMode('send')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                viewMode === 'send'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#6B6A66] hover:text-[#141414]'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" /> Send
            </button>
            <button
              type="button"
              onClick={() => setViewMode('receive')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                viewMode === 'receive'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#6B6A66] hover:text-[#141414]'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" /> Receive
            </button>
          </div>

          {/* Currency Dropdown Selector */}
          {onCurrencyChange ? (
            <CurrencySelector value={currency} onChange={onCurrencyChange} />
          ) : (
            <span className="px-3 py-1 bg-[#FAFAF7] border border-[#EAE9E4] rounded-full text-[11px] font-semibold text-[#141414]">
              {currency}
            </span>
          )}
        </div>

        {/* View Mode Description Tag */}
        <div className="mt-4">
          <span className="text-xs font-medium text-[#6B6A66] block">{displayLabel}</span>

          {/* Big Amount Number with Dynamic Auto-Scaling */}
          <h2
            className={`${getAmountFontSize(
              displayAmount,
              'totalBalance'
            )} font-extrabold ${
              viewMode === 'send'
                ? 'text-[#E74D28]'
                : viewMode === 'receive'
                ? 'text-[#16A34A]'
                : 'text-[#141414]'
            } tracking-tight mt-1 leading-tight whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-300`}
            title={displayAmount}
          >
            {displayAmount}
          </h2>

          {/* Trend & Contextual Metrics */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            {viewMode === 'total' && (
              <>
                <span className="font-semibold text-[#16A34A]">{trendPercentage}</span>
                <span className="text-[#6B6A66]">vs last month</span>
              </>
            )}
            {viewMode === 'send' && (
              <>
                <span className="font-semibold text-[#E74D28]">↓ {expenseCount} payments</span>
                <span className="text-[#6B6A66]">debited this month</span>
              </>
            )}
            {viewMode === 'receive' && (
              <>
                <span className="font-semibold text-[#16A34A]">↑ {incomeCount} deposits</span>
                <span className="text-[#6B6A66]">credited this month</span>
              </>
            )}
          </div>
        </div>

        {/* Contextual Action Buttons */}
        <div className="mt-5">
          {viewMode === 'total' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#141414] hover:bg-[#27272A] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Send Money
              </button>
              <button
                type="button"
                onClick={handleReceive}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#E7E6DF] text-[#141414] text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Receive Money
              </button>
            </div>
          )}

          {viewMode === 'send' && (
            <button
              type="button"
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#141414] hover:bg-[#27272A] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + New Send Payment (Expense)
            </button>
          )}

          {viewMode === 'receive' && (
            <button
              type="button"
              onClick={handleReceive}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#E74D28] hover:bg-[#D43E1B] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + New Receive Deposit (Income)
            </button>
          )}
        </div>
      </div>

      {/* Wallets Recessed Tray Container */}
      <div className="mt-7 bg-[#F6F5F0] border border-[#EBEAE3] rounded-[24px] p-3.5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[13px] font-bold text-[#141414] flex items-center gap-1.5">
            <WalletIcon className="w-3.5 h-3.5 text-[#6B6A66]" />
            Wallets <span className="text-[#9E9D97] font-normal ml-0.5">· {wallets.length} total</span>
          </span>
          <span className="text-[11px] text-[#9E9D97]">
            {viewMode === 'send'
              ? 'Debit accounts'
              : viewMode === 'receive'
              ? 'Credit accounts'
              : 'Active holdings'}
          </span>
        </div>

        {wallets.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#9E9D97] italic">
            No wallets created yet. Head to <span className="font-semibold text-[#141414]">Account</span> to link a wallet.
          </div>
        ) : (
          /* Grid of Pure White Wallet Cards */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {wallets.map((wallet) => (
              <div
                key={wallet.currency + wallet.balance}
                className="bg-[#FFFFFF] border border-[#EAE8E0] rounded-[18px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              >
                {/* Currency Icon & Label */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {wallet.symbol}
                  </span>
                  <span className="text-[13px] font-bold text-[#141414] tracking-tight">{wallet.currency}</span>
                </div>

                {/* Balance & Sub-details with Dynamic Scaling */}
                <div className="overflow-hidden">
                  <p
                    className={`${getAmountFontSize(
                      wallet.balance,
                      'walletTray'
                    )} font-bold text-[#141414] tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}
                    title={wallet.balance}
                  >
                    {wallet.balance}
                  </p>
                  <p className="text-[11px] text-[#9E9D97] mt-1 font-normal">
                    {wallet.limit}
                  </p>
                  <span
                    className={`inline-block text-[11px] font-semibold mt-3 ${
                      wallet.status === 'Active' ? 'text-[#16A34A]' : 'text-[#E74D28]'
                    }`}
                  >
                    {wallet.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
