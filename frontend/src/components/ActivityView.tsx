import React, { useState } from 'react';
import { Search, Download, Check, Trash2, ArrowUpRight, ArrowDownLeft, Layers } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { formatCurrencyAmount, convertCurrency, type CurrencyCode } from '../lib/currency';
import { getAmountFontSize } from '../lib/dynamicSize';
import type { Account, Transaction } from '../types';

interface ActivityViewProps {
  transactions: Transaction[];
  accounts?: Account[];
  currency?: CurrencyCode;
  onCurrencyChange?: (c: CurrencyCode) => void;
  onDeleteTransaction?: (id: string, accountId: string, amount: number, type: string) => void;
  onOpenSend?: () => void;
  onOpenReceive?: () => void;
  onOpenTransfer?: () => void;
  onOpenRequest?: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  transactions = [],
  accounts = [],
  currency = 'INR',
  onCurrencyChange,
  onDeleteTransaction,
  onOpenSend,
  onOpenReceive,
  onOpenTransfer,
  onOpenRequest,
}) => {
  const handleSend = onOpenSend || onOpenTransfer;
  const handleReceive = onOpenReceive || onOpenRequest;

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [checkedIds, setCheckedIds] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getInitialStyle = (index: number) => {
    const styles = [
      { bg: 'bg-[#141414]', color: 'text-white border-transparent' },
      { bg: 'bg-[#FAFAF7]', color: 'text-[#141414] border-[#EAE9E4]' },
      { bg: 'bg-[#E74D28]', color: 'text-white border-transparent' },
      { bg: 'bg-[#F3F2ED]', color: 'text-[#141414] border-[#E7E6DF]' },
    ];
    return styles[index % styles.length];
  };

  // Filter logic
  const filtered = transactions.filter((t) => {
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const desc = t.description?.toLowerCase() || '';
    const cat = t.categories?.name?.toLowerCase() || '';
    const s = searchTerm.toLowerCase();
    const matchesSearch = desc.includes(s) || cat.includes(s) || t.id.toLowerCase().includes(s);
    return matchesType && matchesSearch;
  });

  const getTxCurrency = (t: Transaction): CurrencyCode => {
    if (t.accounts?.currency) return t.accounts.currency.toUpperCase() as CurrencyCode;
    const match = accounts.find((a) => a.id === t.account_id);
    if (match?.currency) return match.currency.toUpperCase() as CurrencyCode;
    return 'INR';
  };

  // Analytics summary calculations converted to selected display currency
  const totalVolume = transactions.reduce((sum, t) => {
    const amt = parseFloat(t.amount as any || 0);
    const accCurrency = getTxCurrency(t);
    return sum + convertCurrency(amt, accCurrency, currency);
  }, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => {
      const amt = parseFloat(t.amount as any || 0);
      const accCurrency = getTxCurrency(t);
      return sum + convertCurrency(amt, accCurrency, currency);
    }, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => {
      const amt = parseFloat(t.amount as any || 0);
      const accCurrency = getTxCurrency(t);
      return sum + convertCurrency(amt, accCurrency, currency);
    }, 0);

  // CSV Export
  const exportToCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Order ID,Activity,Date,Type,Amount,Account'];
    const rows = filtered.map(
      (t) =>
        `INV-${t.id.slice(0, 6).toUpperCase()},"${t.description || t.categories?.name || 'General'}",${t.transaction_date},${t.type},${t.amount},"${t.accounts?.name || 'Account'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kova-activity-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
            Activity & Transactions
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6A66] mt-1">
            Complete transaction ledger with live filtering, category tracking, and data export.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onCurrencyChange && (
            <CurrencySelector value={currency} onChange={onCurrencyChange} />
          )}
          <button
            onClick={handleSend}
            className="flex items-center gap-2 py-2.5 px-4 bg-[#141414] hover:bg-[#27272A] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Send
          </button>
          <button
            onClick={handleReceive}
            className="flex items-center gap-2 py-2.5 px-4 bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#E7E6DF] text-[#141414] text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Receive
          </button>
          <button
            onClick={exportToCSV}
            className="p-2.5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-full text-[#6B6A66] hover:text-[#141414] hover:bg-[#FAFAF7] transition cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards - 100% Theme Consistent with Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Volume - Hero Dark Ink Card */}
        <div className="bg-[#141414] text-white rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80">Total Volume</span>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-4 overflow-hidden">
            <h3
              className={`${getAmountFontSize(
                formatCurrencyAmount(totalVolume, currency, currency),
                'activitySummary'
              )} font-extrabold tracking-tight leading-tight text-white whitespace-nowrap overflow-hidden text-ellipsis`}
              title={formatCurrencyAmount(totalVolume, currency, currency)}
            >
              {formatCurrencyAmount(totalVolume, currency, currency)}
            </h3>
            <p className="text-xs text-white/70 mt-1">{transactions.length} total entries</p>
          </div>
        </div>

        {/* Total Inflow */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6A66]">Total Inflow</span>
            <div className="w-8 h-8 rounded-full bg-[#FAFAF7] border border-[#EAE9E4] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-[#141414]" />
            </div>
          </div>
          <div className="mt-4 overflow-hidden">
            <h3
              className={`${getAmountFontSize(
                formatCurrencyAmount(totalIncome, currency, currency),
                'activitySummary'
              )} font-extrabold text-[#141414] tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}
              title={formatCurrencyAmount(totalIncome, currency, currency)}
            >
              {formatCurrencyAmount(totalIncome, currency, currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="font-semibold text-[#16A34A]">↑ Inflow</span>
              <span className="text-[#6B6A66]">active deposits</span>
            </div>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6A66]">Total Outflow</span>
            <div className="w-8 h-8 rounded-full bg-[#FAFAF7] border border-[#EAE9E4] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-[#141414]" />
            </div>
          </div>
          <div className="mt-4 overflow-hidden">
            <h3
              className={`${getAmountFontSize(
                formatCurrencyAmount(totalExpense, currency, currency),
                'activitySummary'
              )} font-extrabold text-[#141414] tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}
              title={formatCurrencyAmount(totalExpense, currency, currency)}
            >
              {formatCurrencyAmount(totalExpense, currency, currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="font-semibold text-[#E74D28]">↓ Outflow</span>
              <span className="text-[#6B6A66]">total expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[24px] p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#9E9D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by description, category or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAFAF7] border border-[#EAE9E4] rounded-full text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#FAFAF7] border border-[#EAE9E4] rounded-full p-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#6B6A66] hover:text-[#141414]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#6B6A66] hover:text-[#141414]'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#6B6A66] hover:text-[#141414]'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Full Activities Ledger Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#141414] tracking-tight">
            Transaction Ledger ({filtered.length})
          </h2>
          <span className="text-xs text-[#9E9D97]">Showing filtered transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0EFEA] text-[11px] font-semibold text-[#9E9D97]">
                <th className="py-2.5 pl-2 pr-3 w-10">
                  <div className="w-4 h-4 rounded border border-[#D8D6CE] bg-[#FAFAF7]" />
                </th>
                <th className="py-2.5 px-3 font-medium">Order ID</th>
                <th className="py-2.5 px-3 font-medium">Activity & Details</th>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium">Price</th>
                <th className="py-2.5 pr-2 pl-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F6F2]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-bold text-[#141414]">No transactions found</p>
                      <p className="text-xs text-[#6B6A66] max-w-sm">
                        No transactions match your current search or filter criteria. Record a new movement or reset your filters.
                      </p>
                      <div className="flex items-center gap-2 pt-3">
                        {handleSend && (
                          <button
                            onClick={handleSend}
                            className="px-3.5 py-1.5 bg-[#141414] text-white text-xs font-semibold rounded-full hover:bg-[#27272A] transition cursor-pointer"
                          >
                            + Send Money
                          </button>
                        )}
                        {handleReceive && (
                          <button
                            onClick={handleReceive}
                            className="px-3.5 py-1.5 bg-[#FAFAF7] border border-[#E7E6DF] text-[#141414] text-xs font-semibold rounded-full hover:bg-[#F3F2ED] transition cursor-pointer"
                          >
                            + Receive Money
                          </button>
                        )}
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="px-3.5 py-1.5 text-xs text-[#6B6A66] hover:text-[#141414] underline cursor-pointer"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const style = getInitialStyle(index);
                  const title = item.description || item.categories?.name || 'General payment';
                  const initial = title.charAt(0).toUpperCase();
                  const orderCode = `INV-${item.id.slice(0, 6).toUpperCase()}`;
                  const isChecked = Boolean(checkedIds[item.id]);

                  return (
                    <tr key={item.id} className="hover:bg-[#FAFAF7]/60 transition">
                      {/* Checkbox */}
                      <td className="py-3.5 pl-2 pr-3">
                        <button
                          onClick={() => toggleCheck(item.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition cursor-pointer ${
                            isChecked
                              ? 'bg-[#141414] text-white border border-[#141414]'
                              : 'border border-[#D8D6CE] bg-[#FAFAF7] hover:border-[#141414]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-3 text-xs font-semibold text-[#141414]">
                        {orderCode}
                      </td>

                      {/* Activity Title + Account */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${style.bg} ${style.color} shrink-0`}
                          >
                            {initial}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-[#141414] block">
                              {title}
                            </span>
                            <span className="text-[10px] text-[#9E9D97]">
                              {item.accounts?.name || 'Account'} {item.categories?.name ? `• ${item.categories.name}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-xs text-[#6B6A66]">
                        {item.transaction_date}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-xs font-bold text-[#141414]">
                        {(() => {
                          const accCurrency = getTxCurrency(item);
                          const isDiff = currency !== accCurrency;
                          return (
                            <div>
                              <span>
                                {item.type === 'income' ? '+' : '-'}
                                {formatCurrencyAmount(Number(item.amount), currency, accCurrency)}
                              </span>
                              {isDiff && (
                                <span className="block text-[10px] text-[#9E9D97] font-normal" title="Native transaction amount">
                                  ({item.type === 'income' ? '+' : '-'}
                                  {formatCurrencyAmount(Number(item.amount), accCurrency, accCurrency)})
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status & Delete Action */}
                      <td className="py-3.5 pr-2 pl-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141414]">
                            <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Completed
                          </span>
                          {onDeleteTransaction && (
                            <button
                              onClick={() =>
                                onDeleteTransaction(
                                  item.id,
                                  item.account_id,
                                  Number(item.amount),
                                  item.type
                                )
                              }
                              className="p-1.5 text-[#9E9D97] hover:text-[#E74D28] transition cursor-pointer"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
