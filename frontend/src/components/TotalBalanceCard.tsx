import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
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
  currency = 'INR',
  onCurrencyChange,
  trendPercentage,
  wallets = [],
  onSend,
  onReceive,
  onTransfer,
  onRequest,
}) => {
  const handleSend = onSend || onTransfer;
  const handleReceive = onReceive || onRequest;

  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Header & Dropdown */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#6B6A66]">Total balance</span>
          {onCurrencyChange ? (
            <CurrencySelector value={currency} onChange={onCurrencyChange} />
          ) : (
            <span className="px-3 py-1 bg-[#FAFAF7] border border-[#EAE9E4] rounded-full text-[11px] font-semibold text-[#141414]">
              {currency}
            </span>
          )}
        </div>

        {/* Big Balance Number with Dynamic Scaling */}
        <h2 className={`${getAmountFontSize(balance, 'totalBalance')} font-extrabold text-[#141414] tracking-tight mt-2.5 leading-tight whitespace-nowrap overflow-hidden text-ellipsis`} title={balance}>
          {balance}
        </h2>

        {/* Trend Indicator: Clean inline text without background pill */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
          <span className="font-semibold text-[#16A34A]">{trendPercentage}</span>
          <span className="text-[#6B6A66]">vs last month</span>
        </div>

        {/* Action Buttons: Solid dark Send vs soft warm Receive */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleSend}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#141414] hover:bg-[#27272A] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Send
          </button>
          <button
            onClick={handleReceive}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#F3F2ED] hover:bg-[#ECEAE3] text-[#141414] text-xs font-semibold rounded-full transition cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Receive
          </button>
        </div>
      </div>

      {/* Wallets Recessed Tray Container */}
      <div className="mt-8 bg-[#F6F5F0] border border-[#EBEAE3] rounded-[24px] p-3.5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[13px] font-bold text-[#141414]">
            Wallets <span className="text-[#9E9D97] font-normal ml-0.5">· {wallets.length} total</span>
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
                  <p className={`${getAmountFontSize(wallet.balance, 'walletTray')} font-bold text-[#141414] tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis`} title={wallet.balance}>
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
