import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  isRead: boolean;
}

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private apiUrl = `${environment.apiUrl}inquiry`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: Inquiry[] }> {
    return this.http.get<{ success: boolean; data: Inquiry[] }>(this.apiUrl);
  }

  markRead(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/read`, {});
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
