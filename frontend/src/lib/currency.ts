export type CurrencyCode = 'INR' | 'USD';

export const USD_TO_INR_RATE = 83.5;

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
  country: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', label: 'INR (₹)', symbol: '₹', country: 'India', flag: '🇮🇳' },
  { code: 'USD', label: 'USD ($)', symbol: '$', country: 'United States', flag: '🇺🇸' },
];

/**
 * Formats a monetary number in the active currency.
 * If raw amount is assumed in USD base (from original template data), it scales to INR by 83.5.
 * If raw amount is already in native currency, it formats directly.
 */
export function formatCurrencyAmount(
  amount: number,
  currency: CurrencyCode,
  isBaseUSD: boolean = false
): string {
  const numericAmount = Number(amount) || 0;
  const converted = isBaseUSD && currency === 'INR' ? numericAmount * USD_TO_INR_RATE : numericAmount;

  if (currency === 'INR') {
    return `₹${converted.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return currency === 'INR' ? '₹' : '$';
}
