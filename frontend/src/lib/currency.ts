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
 * Universal exchange rates normalized against 1 USD base.
 * 1 USD = 83.5 INR
 * 1 USD = 0.92 EUR
 * 1 USD = 0.78 GBP
 */
export const RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  INR: 1.0 / 83.5,
  EUR: 1.0 / 0.92,
  GBP: 1.0 / 0.78,
};

/**
 * Converts an amount from a source currency to a target currency.
 * Handles USD <-> INR and any other supported currency seamlessly.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode | string = 'INR',
  to: CurrencyCode | string = 'INR'
): number {
  const fromCode = (from || 'INR').toUpperCase();
  const toCode = (to || 'INR').toUpperCase();
  const val = Number(amount) || 0;

  if (fromCode === toCode) return val;

  // Direct fast path for USD <-> INR
  if (fromCode === 'USD' && toCode === 'INR') {
    return val * USD_TO_INR_RATE;
  }
  if (fromCode === 'INR' && toCode === 'USD') {
    return val / USD_TO_INR_RATE;
  }

  // Generalized multi-currency conversion via USD base
  const fromRate = RATES_TO_USD[fromCode] || 1;
  const toRate = RATES_TO_USD[toCode] || 1;
  const valInUSD = val * fromRate;
  return valInUSD / toRate;
}

/**
 * Formats a monetary number in the active display currency.
 * Automatically converts the amount if its native source currency differs from the target display currency.
 * Backwards-compatible with legacy isBaseUSD parameter.
 */
export function formatCurrencyAmount(
  amount: number,
  displayCurrency: CurrencyCode = 'INR',
  nativeCurrencyOrIsBaseUSD: CurrencyCode | string | boolean = displayCurrency
): string {
  const numericAmount = Number(amount) || 0;

  // Handle backwards-compatibility if a boolean was passed for isBaseUSD
  let sourceCurrency: CurrencyCode | string;
  if (typeof nativeCurrencyOrIsBaseUSD === 'boolean') {
    sourceCurrency = nativeCurrencyOrIsBaseUSD ? 'USD' : displayCurrency;
  } else {
    sourceCurrency = nativeCurrencyOrIsBaseUSD;
  }

  const converted = convertCurrency(numericAmount, sourceCurrency, displayCurrency);

  if (displayCurrency === 'INR') {
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

export function getCurrencySymbol(currency: string = 'INR'): string {
  const c = (currency || 'INR').toUpperCase();
  if (c === 'INR') return '₹';
  if (c === 'USD') return '$';
  if (c === 'EUR') return '€';
  if (c === 'GBP') return '£';
  return '$';
}
