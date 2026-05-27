import { environment } from 'src/environments/environment';
// src/app/Services/discounts.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Discount {
  discountId?: string;
  discountPercentage: number;
  validFrom: string;
  validTill: string;
}

export interface PaginatedResult {
  items: Discount[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface Message {
  success: boolean;
  data: PaginatedResult; // Updated to remove nested 'result'
}

@Injectable({
  providedIn: 'root'
})
export class DiscountsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  addDiscount(discount: Discount): Observable<any> {
    return this.http.post(`${this.apiUrl}discount/add-discount`, discount);
  }

  getAllDiscounts(pageNumber: number, pageSize: number): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}discount/get-all-discounts?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  getDiscountById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}discount/get-discount-by-id/${id}`);
  }

  deleteDiscount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}discount/deleteDiscount/${id}`, { body: { id } });
  }
}
