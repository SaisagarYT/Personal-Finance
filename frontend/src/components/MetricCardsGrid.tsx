import React from 'react';
import { Wallet, CreditCard, Coins, TrendingUp } from 'lucide-react';
import { getAmountFontSize } from '../lib/dynamicSize';

interface MetricItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendType: 'positive' | 'negative';
  period: string;
  isHero?: boolean;
}

interface MetricCardsGridProps {
  earnings?: string;
  spending?: string;
  income?: string;
  revenue?: string;
  incomeCount?: number;
  expenseCount?: number;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  earnings = '₹0.00',
  spending = '₹0.00',
  income = '₹0.00',
  revenue = '₹0.00',
  incomeCount = 0,
  expenseCount = 0,
}) => {
  const metrics: MetricItem[] = [
    {
      id: 'earnings',
      label: 'Total earnings',
      value: earnings,
      trend: incomeCount > 0 ? `${incomeCount} credits` : '0 entries',
      trendType: 'positive',
      period: 'this month',
      isHero: true,
    },
    {
      id: 'spending',
      label: 'Total spending',
      value: spending,
      trend: expenseCount > 0 ? `${expenseCount} debits` : '0 entries',
      trendType: 'negative',
      period: 'this month',
    },
    {
      id: 'income',
      label: 'Total income',
      value: income,
      trend: incomeCount > 0 ? 'Active inflow' : 'No deposits',
      trendType: 'positive',
      period: 'this month',
    },
    {
      id: 'revenue',
      label: 'Total revenue',
      value: revenue,
      trend: 'Net monthly delta',
      trendType: 'positive',
      period: 'this month',
    },
  ];

  const getMetricIcon = (id: string, isHero?: boolean) => {
    const iconClass = `w-4 h-4 ${isHero ? 'text-white' : 'text-[#141414]'}`;
    switch (id) {
      case 'earnings':
        return <Wallet className={iconClass} />;
      case 'spending':
        return <CreditCard className={iconClass} />;
      case 'income':
        return <Coins className={iconClass} />;
      default:
        return <TrendingUp className={iconClass} />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {metrics.map((m) => {
        if (m.isHero) {
          return (
            <div
              key={m.id}
              className="bg-[#E74D28] text-white rounded-[28px] p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/90">{m.label}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {getMetricIcon(m.id, true)}
                </div>
              </div>

              <div className="mt-4 overflow-hidden">
                <h3 className={`${getAmountFontSize(m.value, 'metricCard')} font-extrabold tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis`} title={m.value}>
                  {m.value}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <span className="font-semibold text-white">{m.trend}</span>
                  <span className="text-white/80">{m.period}</span>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={m.id}
            className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B6A66]">{m.label}</span>
              <div className="w-8 h-8 rounded-full bg-[#FAFAF7] border border-[#EAE9E4] flex items-center justify-center">
                {getMetricIcon(m.id, false)}
              </div>
            </div>

            <div className="mt-4 overflow-hidden">
              <h3 className={`${getAmountFontSize(m.value, 'metricCard')} font-extrabold text-[#141414] tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis`} title={m.value}>
                {m.value}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                <span
                  className={`font-semibold ${
                    m.trendType === 'positive' ? 'text-[#16A34A]' : 'text-[#E74D28]'
                  }`}
                >
                  {m.trend}
                </span>
                <span className="text-[#6B6A66]">{m.period}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
