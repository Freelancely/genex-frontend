import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface User {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  phoneNumber: string;
  role?: string;
  isBanned: boolean;
}

interface Message {
  items: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface ApiResponse {
  success: boolean;
  message: Message | string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const body = { pageNumber, pageSize };
    return this.http.post<ApiResponse>(`${this.apiUrl}user/all`, body);
  }

  disableUser(userId: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}user/disable/${userId}`, {});
  }

  restoreUser(userId: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}user/restore/${userId}`, {});
  }

  deleteUser(userId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}user/delete/${userId}`);
  }
}
