import { APP } from './constants';

/**
 * Format an integer amount as currency, e.g. `150` → `ETB 150.00`.
 * Falls back to manual formatting if the runtime lacks ETB locale data.
 */
export function formatBirr(amount: number, currency: string = APP.CURRENCY): string {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** Compact form for tight layouts: `150` → `ETB 150`. */
export function formatBirrCompact(amount: number, currency: string = APP.CURRENCY): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${currency} ${Number.isInteger(value) ? value : value.toFixed(2)}`;
}
