import React, { useState } from 'react';
import { Check, Trash2, ArrowRight } from 'lucide-react';
import { formatCurrencyAmount, type CurrencyCode } from '../lib/currency';
import type { Transaction } from '../types';

interface RecentActivitiesTableProps {
  transactions?: Transaction[];
  currency?: CurrencyCode;
  onViewAll?: () => void;
  onDeleteTransaction?: (id: string, accountId: string, amount: number, type: string) => void;
}

export const RecentActivitiesTable: React.FC<RecentActivitiesTableProps> = ({
  transactions = [],
  currency = 'INR',
  onViewAll,
  onDeleteTransaction,
}) => {
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

  // Only display the 4 to 5 most recent transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm">
      {/* Table Header: Clean, with no search or filter bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#141414] tracking-tight">Recent activities</h2>
          <p className="text-xs text-[#9E9D97] mt-0.5">Latest financial movements</p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#141414] hover:text-[#E74D28] transition cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Activities Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F0EFEA] text-[11px] font-semibold text-[#9E9D97]">
              <th className="py-2.5 pl-2 pr-3 w-10">
                <div className="w-4 h-4 rounded border border-[#D8D6CE] bg-[#FAFAF7]" />
              </th>
              <th className="py-2.5 px-3 font-medium">Order ID</th>
              <th className="py-2.5 px-3 font-medium">Activity</th>
              <th className="py-2.5 px-3 font-medium">Price</th>
              <th className="py-2.5 pr-2 pl-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F6F2]">
            {recentTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[#9E9D97] italic">
                  No recent activity recorded yet. Click "+ Transfer" or "+ Request" to log a transaction.
                </td>
              </tr>
            ) : (
              recentTransactions.map((item, index) => {
                const style = getInitialStyle(index);
                const title = item.description || item.categories?.name || 'General payment';
                const initial = title.charAt(0).toUpperCase();
                const orderCode = `INV-${item.id.slice(0, 6).toUpperCase()}`;
                const isChecked = Boolean(checkedIds[item.id]);

                return (
                  <tr key={item.id} className="hover:bg-[#FAFAF7]/60 transition">
                    <td className="py-3 pl-2 pr-3">
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

                    <td className="py-3 px-3 text-xs font-semibold text-[#141414]">{orderCode}</td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] border ${style.bg} ${style.color}`}
                        >
                          {initial}
                        </span>
                        <div>
                          <span className="text-xs font-semibold text-[#141414]">{title}</span>
                          <span className="block text-[10px] text-[#9E9D97]">
                            {item.accounts?.name || 'Account'} • {item.transaction_date}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-xs font-bold text-[#141414]">
                      {item.type === 'income' ? '+' : '-'}
                      {formatCurrencyAmount(Number(item.amount), currency, true)}
                    </td>

                    <td className="py-3 pr-2 pl-3">
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
                            className="p-1 text-[#9E9D97] hover:text-[#E74D28] transition cursor-pointer"
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
  );
};
