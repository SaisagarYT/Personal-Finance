import React from 'react';

interface SpendingLimitCardProps {
  spentAmount?: string;
  totalLimit?: string;
  spentPercentage?: number;
}

export const SpendingLimitCard: React.FC<SpendingLimitCardProps> = ({
  spentAmount = '$1,400.00',
  totalLimit = '$5,500.00',
  spentPercentage = 26,
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-[#141414]">Monthly spending limit</h3>

        {/* Diagonal Striped Track with Solid Orange Fill */}
        <div className="w-full h-3.5 rounded-full overflow-hidden mt-3 relative striped-track border border-[#EAE9E4]/50">
          <div
            className="h-full bg-[#E74D28] rounded-full transition-all duration-500"
            style={{ width: `${spentPercentage}%` }}
          />
        </div>
      </div>

      {/* Footer Labels */}
      <div className="flex items-center justify-between text-xs font-bold text-[#141414] mt-4">
        <span>
          {spentAmount} <span className="text-[#9E9D97] font-normal">spent of</span>
        </span>
        <span>{totalLimit}</span>
      </div>
    </div>
  );
};
