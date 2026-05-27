import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminUser {
  userId: string;
  firstname: string;
  lastname?: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isDeleted: boolean;
}

export interface CreateAdminPayload {
  firstname: string;
  lastname?: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  role: 'Admin' | 'StoreKeeper' | 'Accountant' | 'Receptionist';
}

@Injectable({ providedIn: 'root' })
export class AdminManagementService {
  private apiUrl = `${environment.apiUrl}user/admins`;

  constructor(private http: HttpClient) {}

  listAdmins(): Observable<{ success: boolean; message: AdminUser[] }> {
    return this.http.get<{ success: boolean; message: AdminUser[] }>(this.apiUrl);
  }

  addAdmin(payload: CreateAdminPayload): Observable<{ success: boolean; message: AdminUser }> {
    return this.http.post<{ success: boolean; message: AdminUser }>(this.apiUrl, payload);
  }

  removeAdmin(adminUserId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${adminUserId}`);
  }
}
