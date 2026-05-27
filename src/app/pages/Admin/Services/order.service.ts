import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IProduct } from '@/types/product-type';
import { environment } from 'src/environments/environment';

interface OrderItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OrderResponse {
  success: boolean;
  message: {
    items: {
      orderId: string;
      orderNo: string;
      fullName: string;
      email: string;
      phone: string;
      orderDateTime: string;
      amountBeforeDiscount: number;
      appliedCouponCode: string | null;
      couponDiscountPercent: number | null;
      amountAfterDiscount: number;
      status: string;
      paymentMethod: string;
      billingInfoId: string;
      orderItems: OrderItem[];
    }[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  } | string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService
  ) {}

  placeOrder(orderedItems: IProduct[], couponCode: string, paymentMode: string, billingInfoId: string, shippingMethod: string, shippingCost: number): Observable<{ success: boolean; message: string; orderId?: string; paymentRequired?: boolean; paymentUrl?: string }> {
    const requestBody = {
      orderedItems: orderedItems.map(item => ({
        productId: item.id,
        quantity: item.orderQuantity || 1
      })),
      couponCode: couponCode || null,
      paymentMode: paymentMode,
      billingInfoId: billingInfoId,
      shippingMethod: shippingMethod,
      shippingCost: shippingCost
    };

    return this.http.post<{ success: boolean; message: string; orderId?: string; paymentRequired?: boolean; paymentUrl?: string }>(`${this.apiUrl}order/place-order`, requestBody).pipe(
      tap(response => {
        if (response.success) {
          this.toastrService.success(response.message);
        } else {
          this.toastrService.error(`Failed to place order: ${response.message}`);
        }
      }),
      catchError(err => {
        this.toastrService.error('Error placing order');
        console.error('placeOrder Error:', err);
        return throwError(() => err);
      })
    );
  }

  getOrders(pageNumber: number, pageSize: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}order/admin/view-orders`, { pageNumber, pageSize }).pipe(
      catchError(err => {
        this.toastrService.error('Error fetching orders');
        console.error('getOrders Error:', err);
        return throwError(() => err);
      })
    );
  }

  changeOrderStatus(orderId: string, status: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}order/admin/change-status`, { orderId, status }).pipe(
      catchError(err => {
        console.error('changeOrderStatus Error:', err);
        return throwError(() => err);
      })
    );
  }

  markPaymentVerified(orderId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}order/admin/${orderId}/verify-payment`,
      {}
    ).pipe(
      catchError(err => {
        console.error('markPaymentVerified Error:', err);
        return throwError(() => err);
      })
    );
  }
}
