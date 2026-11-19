import React from 'react';
import type { CurrencyCode } from '../lib/currency';

export interface ChartDataPoint {
  month: string;
  loss: number;
  profit: number;
  profitFormatted?: string;
  lossFormatted?: string;
  total?: number;
}

interface IncomeChartWithLimitCardProps {
  spentAmount?: string;
  totalLimit?: string;
  spentPercentage?: number;
  chartData?: ChartDataPoint[];
  currency?: CurrencyCode;
}

const DEFAULT_CHART_MONTHS: ChartDataPoint[] = [
  { month: 'Jun', loss: 0, profit: 0 },
  { month: 'Jul', loss: 0, profit: 0 },
  { month: 'Aug', loss: 0, profit: 0 },
  { month: 'Sep', loss: 0, profit: 0 },
  { month: 'Oct', loss: 0, profit: 0 },
  { month: 'Nov', loss: 0, profit: 0 },
];

export const IncomeChartWithLimitCard: React.FC<IncomeChartWithLimitCardProps> = ({
  spentAmount = '₹0.00',
  totalLimit = '₹50,000.00',
  spentPercentage = 0,
  chartData,
  currency = 'INR',
}) => {
  const displayData = chartData && chartData.length > 0 ? chartData : DEFAULT_CHART_MONTHS;

  // Compute maximum bar total for dynamic Y-axis scaling
  const maxDataVal = Math.max(...displayData.map((d) => d.loss + d.profit), 0);
  const ceiling = maxDataVal > 0 ? maxDataVal * 1.15 : (currency === 'INR' ? 150000 : 2000);

  // Generate 5 dynamic tick labels for Y-axis
  const formatTick = (val: number) => {
    if (val <= 0) return '0';
    if (currency === 'INR') {
      return val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${Math.round(val / 1000)}k`;
    }
    return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${Math.round(val)}`;
  };

  const yTicks = [
    formatTick(ceiling),
    formatTick(ceiling * 0.75),
    formatTick(ceiling * 0.5),
    formatTick(ceiling * 0.25),
    '0',
  ];

  const firstMonth = displayData[0]?.month || 'Jan';
  const lastMonth = displayData[displayData.length - 1]?.month || 'Dec';
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
      {/* Top Section: Profit & Loss Chart */}
      <div>
        <h2 className="text-lg font-bold text-[#141414] tracking-tight">Total income & cash flow</h2>
        <p className="text-xs text-[#9E9D97] mt-0.5">
          Profit and loss by month ({firstMonth}–{lastMonth} {currentYear})
        </p>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 mb-2.5 px-1">
          <span className="text-xs font-semibold text-[#141414]">Profit & loss</span>
          <div className="flex items-center gap-3 text-[11px] font-medium text-[#6B6A66]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E74D28]" />
              <span>Profit (Inflow)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#141414]" />
              <span>Loss (Outflow)</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="bg-[#FAFAF7] border border-[#EAE9E4] rounded-[20px] p-3.5 pt-5">
          <div className="flex items-stretch gap-2 h-44">
            {/* Dynamic Y-Axis Labels */}
            <div className="flex flex-col justify-between text-[10px] text-[#9E9D97] font-medium py-1 text-right w-7 shrink-0">
              {yTicks.map((tick, i) => (
                <span key={i}>{tick}</span>
              ))}
            </div>

            {/* Stacked Bars Container */}
            <div className="flex-1 flex items-end justify-between gap-1.5 sm:gap-2 px-1 pb-1">
              {displayData.map((item) => {
                const total = item.loss + item.profit;
                const totalHeightPct = total > 0 ? Math.min((total / ceiling) * 100, 100) : 4;
                const lossPctOfBar = total > 0 ? (item.loss / total) * 100 : 50;
                const profitPctOfBar = total > 0 ? (item.profit / total) * 100 : 50;

                const tooltipTitle = `${item.month}: Inflow +${item.profitFormatted || item.profit.toFixed(0)} | Outflow -${item.lossFormatted || item.loss.toFixed(0)}`;

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    title={tooltipTitle}
                  >
                    {/* The Stacked Bar */}
                    <div
                      className="w-full max-w-[28px] rounded-full overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:scale-105 group-hover:opacity-90"
                      style={{ height: `${totalHeightPct}%` }}
                    >
                      {/* Top: Profit (Diagonal Striped Orange) */}
                      <div
                        className="w-full"
                        style={{
                          height: `${profitPctOfBar}%`,
                          background:
                            'repeating-linear-gradient(-45deg, #E74D28, #E74D28 3px, #FCE7E2 3px, #FCE7E2 6px)',
                        }}
                      />
                      {/* Bottom: Loss (Solid Black/Charcoal) */}
                      <div
                        className="w-full bg-[#141414]"
                        style={{ height: `${lossPctOfBar}%` }}
                      />
                    </div>

                    {/* X-Axis Month Label */}
                    <span className="text-[10px] text-[#9E9D97] mt-1.5 font-medium group-hover:text-[#141414] transition-colors">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Monthly Spending Limit */}
      <div className="mt-5 pt-4 border-t border-[#EAE9E4]/60">
        <h3 className="text-xs font-bold text-[#141414]">Monthly spending limit</h3>

        {/* Diagonal Striped Track with Solid Orange Fill */}
        <div className="w-full h-3.5 rounded-full overflow-hidden mt-2.5 relative striped-track border border-[#EAE9E4]/50">
          <div
            className="h-full bg-[#E74D28] rounded-full transition-all duration-500"
            style={{ width: `${spentPercentage}%` }}
          />
        </div>

        {/* Footer Labels */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-[#141414] mt-3">
          <span className="truncate max-w-[65%]">
            {spentAmount} <span className="text-[#9E9D97] font-normal">spent of</span>
          </span>
          <span className="truncate">{totalLimit}</span>
        </div>
      </div>
    </div>
  );
};
