import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface BillingInfo {
  billingInfoId: string;
  fullName: string;
  phoneNUmber: string;
  province: string;
  city: string;
  address: string;
  landMark: string;
  label: string;
}

interface BillingInfoResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingInfoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBillingInfos(): Observable<{ success: boolean; message: BillingInfo[] }> {
    return this.http.get<{ success: boolean; message: BillingInfo[] }>(`${this.apiUrl}billingInfo`).pipe(
      catchError(err => {
        console.error('getBillingInfos Error:', err);
        return throwError(() => err);
      })
    );
  }

  getBillingInfoById(id: string): Observable<{ success: boolean; message: BillingInfo }> {
    return this.http.get<{ success: boolean; message: BillingInfo }>(`${this.apiUrl}billingInfo/${id}`).pipe(
      catchError(err => {
        console.error('getBillingInfoById Error:', err);
        return throwError(() => err);
      })
    );
  }

  createBillingInfo(billingInfo: BillingInfo): Observable<BillingInfoResponse> {
    return this.http.post<BillingInfoResponse>(`${this.apiUrl}billingInfo`, billingInfo).pipe(
      catchError(err => {
        console.error('createBillingInfo Error:', err);
        return throwError(() => err);
      })
    );
  }

  updateBillingInfo(id: string, billingInfo: BillingInfo): Observable<BillingInfoResponse> {
    return this.http.put<BillingInfoResponse>(`${this.apiUrl}billingInfo/${id}`, billingInfo).pipe(
      catchError(err => {
        console.error('updateBillingInfo Error:', err);
        return throwError(() => err);
      })
    );
  }

  deleteBillingInfo(id: string): Observable<BillingInfoResponse> {
    return this.http.delete<BillingInfoResponse>(`${this.apiUrl}billingInfo/${id}`).pipe(
      catchError(err => {
        console.error('deleteBillingInfo Error:', err);
        return throwError(() => err);
      })
    );
  }
}
