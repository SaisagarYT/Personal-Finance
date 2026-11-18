import React from 'react';

interface ChartDataPoint {
  month: string;
  loss: number;
  profit: number;
}

interface IncomeChartCardProps {
  spentAmount?: string;
  totalLimit?: string;
  spentPercentage?: number;
}

const CHART_DATA: ChartDataPoint[] = [
  { month: 'Jan', loss: 20, profit: 16 },
  { month: 'Feb', loss: 17, profit: 21 },
  { month: 'Mar', loss: 14, profit: 18 },
  { month: 'Apr', loss: 19, profit: 19 },
  { month: 'May', loss: 22, profit: 24 },
  { month: 'Jun', loss: 31, profit: 21 },
  { month: 'Jul', loss: 20, profit: 18 },
  { month: 'Aug', loss: 15, profit: 16 },
];

export const IncomeChartCard: React.FC<IncomeChartCardProps> = ({
  spentAmount = '$1,400.00',
  totalLimit = '$5,500.00',
  spentPercentage = 26,
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full">
      {/* SVG Pattern Definition for Striped Diagonal Orange Bars */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern
            id="diagonalHatch"
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#E74D28" strokeWidth="2.5" />
            <line x1="0" y1="0" x2="6" y2="0" stroke="#FDECE8" strokeWidth="2.5" />
          </pattern>
        </defs>
      </svg>

      {/* Top Header */}
      <div>
        <h2 className="text-lg font-bold text-[#141414] tracking-tight">Total income</h2>
        <p className="text-xs text-[#9E9D97] mt-0.5">Profit and loss by month, Jan–Aug 2026</p>

        {/* Legend */}
        <div className="flex items-center justify-between mt-5 mb-3 px-1">
          <span className="text-xs font-semibold text-[#141414]">Profit & loss</span>
          <div className="flex items-center gap-3 text-[11px] font-medium text-[#6B6A66]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E74D28]" />
              <span>Profit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#141414]" />
              <span>Loss</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="bg-[#FAFAF7] border border-[#EAE9E4] rounded-[20px] p-4 pt-6">
          <div className="flex items-stretch gap-2 h-52">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-[10px] text-[#9E9D97] font-medium py-1 text-right w-6 shrink-0">
              <span>60k</span>
              <span>45k</span>
              <span>30k</span>
              <span>15k</span>
              <span>0</span>
            </div>

            {/* Stacked Bars Container */}
            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-1 pb-1">
              {CHART_DATA.map((item) => {
                const totalK = item.loss + item.profit;
                const totalHeightPct = (totalK / 60) * 100;
                const lossPctOfBar = (item.loss / totalK) * 100;
                const profitPctOfBar = (item.profit / totalK) * 100;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end">
                    {/* The Stacked Bar */}
                    <div
                      className="w-full max-w-[28px] rounded-full overflow-hidden flex flex-col justify-end"
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
                    <span className="text-[10px] text-[#9E9D97] mt-2 font-medium">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Monthly Spending Limit Section */}
      <div className="mt-6 pt-5 border-t border-[#EAE9E4]/60">
        <h3 className="text-xs font-bold text-[#141414]">Monthly spending limit</h3>

        {/* Diagonal Striped Track with Solid Orange Fill */}
        <div className="w-full h-3.5 rounded-full overflow-hidden mt-3 relative striped-track border border-[#EAE9E4]/50">
          <div
            className="h-full bg-[#E74D28] rounded-full transition-all duration-500"
            style={{ width: `${spentPercentage}%` }}
          />
        </div>

        {/* Footer Labels */}
        <div className="flex items-center justify-between text-xs font-bold text-[#141414] mt-3">
          <span>
            {spentAmount} <span className="text-[#9E9D97] font-normal">spent of</span>
          </span>
          <span>{totalLimit}</span>
        </div>
      </div>
    </div>
  );
};
