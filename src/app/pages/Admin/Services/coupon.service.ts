// coupon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Coupon {
  couponId?: string;
  id?: string;
  couponCode: string;
  couponName: string;
  CouponName?: string;
  startDate: string;
  endDate: string;
  discountPercent: number;
  couponImageUrl?: string;
  couponImage?: string;
  CouponImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  addCoupon(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}coupon/add-coupon`, formData);
  }

  updateCoupon(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}coupon/${id}`, formData);
  }

  getAllCoupons(): Observable<{ success: boolean; message: Coupon[] }> {
    return this.http.get<{ success: boolean; message: Coupon[] }>(`${this.apiUrl}coupon/view-all-coupon`);
  }

  getValidCoupons(): Observable<{ success: boolean; message: Coupon[] }> {
    return this.http.get<{ success: boolean; message: Coupon[] }>(`${this.apiUrl}coupon/view-valid-coupon`);
  }

  verifyCoupon(couponCode: string): Observable<{ success: boolean; message: string; discount?: number }> {
    return this.http.post<{ success: boolean; message: string; discount?: number }>(`${this.apiUrl}coupon/verify/${couponCode}`, { couponCode });
  }
}
