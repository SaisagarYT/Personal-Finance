import React, { useState } from 'react';
import { Search, SlidersHorizontal, Check, Trash2 } from 'lucide-react';
import type { Transaction } from '../types';

interface RecentActivitiesTableProps {
  transactions?: Transaction[];
  onDeleteTransaction?: (id: string, accountId: string, amount: number, type: string) => void;
}

export const RecentActivitiesTable: React.FC<RecentActivitiesTableProps> = ({
  transactions = [],
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedIds, setCheckedIds] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getInitialStyle = (index: number) => {
    const styles = [
      { bg: 'bg-[#E0F2FE]', color: 'text-[#0284C7]' },
      { bg: 'bg-[#EDE9FE]', color: 'text-[#7C3AED]' },
      { bg: 'bg-[#F3E8FF]', color: 'text-[#9333EA]' },
      { bg: 'bg-[#FEF3C7]', color: 'text-[#D97706]' },
      { bg: 'bg-[#FEE2E2]', color: 'text-[#DC2626]' },
      { bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]' },
    ];
    return styles[index % styles.length];
  };

  const filtered = transactions.filter((t) => {
    const desc = t.description?.toLowerCase() || '';
    const cat = t.categories?.name?.toLowerCase() || '';
    const s = searchTerm.toLowerCase();
    return desc.includes(s) || cat.includes(s) || t.id.toLowerCase().includes(s);
  });

  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 sm:p-7 shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <h2 className="text-lg font-bold text-[#141414] tracking-tight">Recent activities</h2>

        <div className="flex items-center gap-2.5">
          {/* Search Pill */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9E9D97] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-[#FAFAF7] border border-[#EAE9E4] rounded-full text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] transition w-36 sm:w-48"
            />
          </div>

          {/* Filter Pill */}
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAFAF7] border border-[#EAE9E4] rounded-full text-xs font-semibold text-[#141414] hover:bg-[#F3F2ED] transition cursor-pointer">
            Filter <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B6A66]" />
          </button>
        </div>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[#9E9D97] italic">
                  No transactions yet. Click "+ Transfer" or "+ Request" above to log activity.
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
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${style.bg} ${style.color}`}
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
                      {item.type === 'income' ? '+' : '-'}$
                      {Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                            className="p-1 text-[#9E9D97] hover:text-[#DC2626] transition cursor-pointer"
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
