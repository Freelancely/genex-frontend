import { Pipe, PipeTransform } from '@angular/core';

/**
 * Format a number as a Nepalese-rupee price.
 *
 * Examples:
 *   2933         -> "NPR 2,933"
 *   2933.5       -> "NPR 2,933.50"
 *   1234567.89   -> "NPR 12,34,567.89"  (en-IN grouping)
 *   null / NaN   -> "NPR 0"
 *
 * Whole numbers don't get a trailing ".00" — that was the noisy part of
 * the old `price.toFixed(2)` output.
 */
@Pipe({ name: 'nprPrice', standalone: false })
export class NprPricePipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
    if (num == null || isNaN(num)) return 'NPR 0';

    const isWhole = Math.abs(num - Math.round(num)) < 0.005;
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    });

    return `NPR ${formatted}`;
  }
}
