/**
 * Dynamically computes optimal font sizing and overflow protection for currency amounts.
 * Ensures numbers remain on a single line, stay strictly within container padding,
 * and seamlessly scale whether in Indian Rupees (INR ₹) or high US Dollar (USD $) amounts.
 */

export type AmountContext = 'totalBalance' | 'metricCard' | 'walletTray' | 'activitySummary';

export function getAmountFontSize(value: string | number | undefined, context: AmountContext): string {
  const str = String(value ?? '');
  const len = str.length;

  switch (context) {
    case 'totalBalance':
      if (len <= 9) return 'text-[32px] sm:text-[38px]';
      if (len <= 12) return 'text-[26px] sm:text-[30px]';
      if (len <= 15) return 'text-[22px] sm:text-[25px]';
      return 'text-[19px] sm:text-[22px]';

    case 'metricCard':
      if (len <= 7) return 'text-[28px] sm:text-[34px]';
      if (len <= 10) return 'text-[22px] sm:text-[25px]';
      if (len <= 13) return 'text-[18px] sm:text-[20px]';
      return 'text-[15px] sm:text-[17px]';

    case 'walletTray':
      if (len <= 8) return 'text-[16px] sm:text-[17px]';
      if (len <= 11) return 'text-[13px] sm:text-[14px]';
      if (len <= 14) return 'text-[12px] sm:text-[13px]';
      return 'text-[10px] sm:text-[11px]';

    case 'activitySummary':
      if (len <= 8) return 'text-[28px] sm:text-[32px]';
      if (len <= 11) return 'text-[22px] sm:text-[25px]';
      if (len <= 14) return 'text-[18px] sm:text-[21px]';
      return 'text-[16px] sm:text-[18px]';
  }
}
