export interface Coupon {
  couponCode: string;
  couponName: string;
  startDate: string;
  endDate: string;
  discountPercent: number;
  logo?: string; // Optional, as API doesn't provide it
  minimumAmount?: number; // Optional, as API doesn't provide it
}
