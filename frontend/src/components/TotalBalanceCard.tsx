import React from 'react';
import { ArrowLeftRight, ArrowDown, ChevronDown } from 'lucide-react';

interface Wallet {
  currency: string;
  symbol: string;
  balance: string;
  limit: string;
  status: 'Active' | 'Inactive';
}

interface TotalBalanceCardProps {
  balance?: string;
  currency?: string;
  trendPercentage?: string;
  wallets?: Wallet[];
  onTransfer?: () => void;
  onRequest?: () => void;
}

const DEFAULT_WALLETS: Wallet[] = [
  {
    currency: 'USD',
    symbol: '$',
    balance: '$22,678.00',
    limit: 'Limit $10k / mo',
    status: 'Active',
  },
  {
    currency: 'EUR',
    symbol: '€',
    balance: '€18,345.00',
    limit: 'Limit €8k / mo',
    status: 'Active',
  },
  {
    currency: 'GBP',
    symbol: '£',
    balance: '£15,000.00',
    limit: 'Limit £7.5k / mo',
    status: 'Inactive',
  },
];

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  balance = '$689,372.00',
  currency = 'USD',
  trendPercentage = '↑ 5%',
  wallets = DEFAULT_WALLETS,
  onTransfer,
  onRequest,
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Header & Dropdown */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#6B6A66]">Total balance</span>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-[#FAFAF7] border border-[#EAE9E4] rounded-full text-[11px] font-semibold text-[#141414] hover:bg-[#F3F2ED] transition cursor-pointer">
            {currency} <ChevronDown className="w-3.5 h-3.5 text-[#6B6A66]" />
          </button>
        </div>

        {/* Big Balance Number */}
        <h2 className="text-[34px] sm:text-[38px] font-extrabold text-[#141414] tracking-tight mt-2.5 leading-tight">
          {balance}
        </h2>

        {/* Trend Indicator: Clean inline text without background pill */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
          <span className="font-semibold text-[#16A34A]">{trendPercentage}</span>
          <span className="text-[#6B6A66]">vs last month</span>
        </div>

        {/* Action Buttons: Solid dark vs soft warm pill */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onTransfer}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#141414] hover:bg-[#27272A] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer
          </button>
          <button
            onClick={onRequest}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#F3F2ED] hover:bg-[#ECEAE3] text-[#141414] text-xs font-semibold rounded-full transition cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" /> Request
          </button>
        </div>
      </div>

      {/* Wallets Sub-Section (no hard divider line) */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#141414]">
            Wallets <span className="text-[#9E9D97] font-normal">· 6 total</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.currency}
              className="bg-[#FAFAF7] border border-[#EAE9E4] rounded-2xl p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-4 h-4 rounded-full bg-[#141414] text-white text-[10px] font-bold flex items-center justify-center">
                  {wallet.symbol}
                </span>
                <span className="text-xs font-bold text-[#141414]">{wallet.currency}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#141414] tracking-tight">{wallet.balance}</p>
                <p className="text-[10px] text-[#9E9D97] mt-0.5">{wallet.limit}</p>
                <span
                  className={`inline-block text-[10px] font-semibold mt-2 ${
                    wallet.status === 'Active' ? 'text-[#16A34A]' : 'text-[#E74D28]'
                  }`}
                >
                  {wallet.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
