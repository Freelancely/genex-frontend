import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface OrderItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  userId: string;
  orderId: string;
  orderNumber?: string;
  orderDateTime: string;
  amountBeforeDiscount: number;
  appliedCouponCode: string | null;
  couponDiscountPercent: number | null;
  amountAfterDiscount: number;
  status: string;
  paymentMethod: string;
  billingInfoId: string;
  orderItems: OrderItem[];
}

export interface OrdersResponse {
  success: boolean;
  message: Order[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  };
}

export interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  phoneNumber: string;
  role: string;
  profileImageUrl?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private ordersApiUrl = environment.apiUrl;
  private profileApiUrl = environment.apiUrl;
  private userApiUrl = `${environment.apiUrl}user/`;

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  refreshProfile(): Observable<UserProfile> {
    return this.getUserProfile().pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }

  getUserOrders(userId: string, pageNumber: number = 1, pageSize: number = 10): Observable<OrdersResponse> {
    const payload = {
      pageNumber,
      pageSize
    };
    return this.http.post<OrdersResponse>(`${this.ordersApiUrl}order/view-orders`, payload);
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.profileApiUrl}user/profile`).pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }

  updateProfile(profile: UserProfile, image: File | null): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('Firstname', profile.firstname);
    formData.append('Lastname', profile.lastname);
    formData.append('Address', profile.address);
    formData.append('PhoneNumber', profile.phoneNumber);
    if (image) {
      formData.append('ProfileImage', image, image.name);
    }

    return this.http.put<ApiResponse>(`${this.userApiUrl}`, formData, {
      headers: { Accept: '*/*' }
    });
  }

  updateProfileImage(image: File): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('ProfileImage', image, image.name);

    return this.http.put<ApiResponse>(`${this.userApiUrl}`, formData, {
      headers: { Accept: '*/*' }
    });
  }

  changePassword(passwordData: { oldPassword: string; newPassword: string; confirmPassword: string }): Observable<ApiResponse> {
    const payload = {
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    };

    return this.http.post<ApiResponse>(`${this.userApiUrl}change-password`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: '*/*' }
    });
  }
}
