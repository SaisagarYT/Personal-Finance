import React, { useState } from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';

interface ActivityItem {
  id: string;
  orderId: string;
  activity: string;
  initial: string;
  initialBg: string;
  initialColor: string;
  price: string;
  status: 'Completed' | 'Pending' | 'In progress';
  checked?: boolean;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    orderId: 'INV-000078',
    activity: 'Payroll transfer',
    initial: 'P',
    initialBg: 'bg-[#E0F2FE]',
    initialColor: 'text-[#0284C7]',
    price: '$18,400',
    status: 'Completed',
  },
  {
    id: '2',
    orderId: 'INV-000077',
    activity: 'Mobile app purchase',
    initial: 'M',
    initialBg: 'bg-[#EDE9FE]',
    initialColor: 'text-[#7C3AED]',
    price: '$25,500',
    status: 'Completed',
  },
  {
    id: '3',
    orderId: 'INV-000076',
    activity: 'Hotel booking',
    initial: 'H',
    initialBg: 'bg-[#F3E8FF]',
    initialColor: 'text-[#9333EA]',
    price: '$32,750',
    status: 'Pending',
  },
  {
    id: '4',
    orderId: 'INV-000075',
    activity: 'Flight ticket',
    initial: 'F',
    initialBg: 'bg-[#E0F2FE]',
    initialColor: 'text-[#0284C7]',
    price: '$40,200',
    status: 'Completed',
  },
  {
    id: '5',
    orderId: 'INV-000073',
    activity: 'Grocery purchase',
    initial: 'G',
    initialBg: 'bg-[#FEF3C7]',
    initialColor: 'text-[#D97706]',
    price: '$50,200',
    status: 'In progress',
    checked: true,
  },
  {
    id: '6',
    orderId: 'INV-000072',
    activity: 'Software license',
    initial: 'S',
    initialBg: 'bg-[#FEE2E2]',
    initialColor: 'text-[#DC2626]',
    price: '$15,900',
    status: 'Completed',
  },
];

export const RecentActivitiesTable: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(DEFAULT_ACTIVITIES);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCheck = (id: string) => {
    setActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141414]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141414]">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Pending
          </span>
        );
      case 'In progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141414]">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" /> In progress
          </span>
        );
    }
  };

  const filtered = activities.filter(
    (a) =>
      a.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[#FAFAF7]/60 transition">
                {/* Custom Checkbox */}
                <td className="py-3 pl-2 pr-3">
                  <button
                    onClick={() => toggleCheck(item.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center transition cursor-pointer ${
                      item.checked
                        ? 'bg-[#141414] text-white border border-[#141414]'
                        : 'border border-[#D8D6CE] bg-[#FAFAF7] hover:border-[#141414]'
                    }`}
                  >
                    {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                </td>

                {/* Order ID */}
                <td className="py-3 px-3 text-xs font-semibold text-[#141414]">
                  {item.orderId}
                </td>

                {/* Activity with Avatar */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${item.initialBg} ${item.initialColor}`}
                    >
                      {item.initial}
                    </span>
                    <span className="text-xs font-semibold text-[#141414]">{item.activity}</span>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3 px-3 text-xs font-bold text-[#141414]">
                  {item.price}
                </td>

                {/* Status */}
                <td className="py-3 pr-2 pl-3">
                  {getStatusBadge(item.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
