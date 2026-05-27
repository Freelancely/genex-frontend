import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private logoutSubject = new Subject<void>();

  constructor(private http: HttpClient) {}

  onLogout(): Observable<void> {
    return this.logoutSubject.asObservable();
  }

  /**
   * Returns an empty HttpHeaders. Auth is now handled via the HttpOnly
   * `genex_token` cookie + the AuthInterceptor's `withCredentials: true`,
   * so manual Authorization headers from localStorage are dead code.
   * Kept as a no-op for backwards compatibility with existing callers.
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  public getHeaders(): HttpHeaders {
    return this.getAuthHeaders();
  }

  register(data: {
    firstname: string;
    lastname: string;
    address: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    profileImage?: File;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('Firstname', data.firstname);
    formData.append('Lastname', data.lastname || '');
    formData.append('Address', data.address);
    formData.append('Email', data.email);
    formData.append('PhoneNumber', data.phoneNumber);
    formData.append('Password', data.password);
    formData.append('ConfirmPassword', data.confirmPassword);
    if (data.profileImage) {
      formData.append('ProfileImage', data.profileImage);
    }

    return this.http.post(`${this.apiUrl}user/register`, formData, {
      headers: new HttpHeaders({
        Accept: '*/*'
      })
    });
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}user/login`, data, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response.success) {
          // The JWT itself is now in an HttpOnly cookie (set by the server).
          // We keep role + userId in localStorage only as UI hints for the SPA;
          // they are NEVER trusted for authorization (server is the source of truth).
          if (response.role) localStorage.setItem('role', response.role);
          if (response.userId) localStorage.setItem('userId', response.userId);
        }
      })
    );
  }

  forgotPassword(data: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}user/forgot-password`, data, { headers: this.getAuthHeaders() });
  }

  resetPassword(data: { data: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}user/reset-password`, data, { headers: this.getAuthHeaders() });
  }

  logout(): void {
    // Server clears the HttpOnly cookie. Fire-and-forget — if it fails (network
    // error, already-expired session) we still want to clear local UI hints
    // and redirect.
    this.http.post(`${this.apiUrl}user/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    // Backwards-compat: clear any legacy token left over from pre-cookie sessions.
    localStorage.removeItem('token');
    this.logoutSubject.next();
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'SuperAdmin' || localStorage.getItem('role') === 'Admin';
  }

  isSuperAdmin(): boolean {
    return localStorage.getItem('role') === 'SuperAdmin';
  }

  getRole(): string {
    return localStorage.getItem('role') ?? '';
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.getRole());
  }

  isAdminLike(): boolean {
    return ['SuperAdmin', 'Admin', 'StoreKeeper', 'Accountant', 'Receptionist']
      .includes(this.getRole());
  }

  /**
   * True if a user session exists. Uses the `role` UI hint kept in localStorage
   * after login. NOT trusted for actual authorization — the server enforces
   * via the HttpOnly auth cookie. This is the synchronous client-side signal
   * used to decide "should we even bother firing this auth-required API call?".
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('role');
  }

  isCustomer(): boolean {
    return localStorage.getItem('role') === 'Customer';
  }

  confirmEmail(email: string, token: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('token', token);
    return this.http.get(`${this.apiUrl}user/authenticateEmail`, { params });
  }
}
