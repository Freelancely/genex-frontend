import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ViewNotificationDTO } from './signalr.service';
import { AuthService } from '@/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<ViewNotificationDTO[]>([]);
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private authService: AuthService
  ) {
    this.fetchNotifications();
  }

  getNotifications(): Observable<ViewNotificationDTO[]> {
    return this.notifications.asObservable();
  }

  fetchNotifications() {
    if (this.authService.isAdmin()) {
      this.notifications.next([]);
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.notifications.next([]);
      return;
    }

    this.http.get<{ success: boolean; message: ViewNotificationDTO[] }>(
      `${this.apiUrl}notification`
    ).pipe(
      tap(response => {
        this.notifications.next(response.success ? response.message : []);
      }),
      catchError(error => {
        console.error('fetchNotifications Error:', error);
        this.notifications.next([]);
        return of([]);
      })
    ).subscribe();
  }

  addNotification(notification: ViewNotificationDTO) {
    if (this.authService.isAdmin()) return;
    const current = this.notifications.value;
    this.notifications.next([notification, ...current]);
  }

  markAsRead(notificationId: string) {
    if (this.authService.isAdmin()) return;

    if (!this.authService.isAuthenticated()) {
      this.toastrService.warning('Please log in to mark notifications as read');
      return;
    }

    this.http.put(`${this.apiUrl}notification/${notificationId}`, {}).pipe(
      tap(() => this.fetchNotifications()),
      catchError(error => {
        console.error('markAsRead Error:', error);
        if (error?.status !== 401 && error?.status !== 403) {
          this.toastrService.error('Failed to mark notification as read');
        }
        return of(null);
      })
    ).subscribe();
  }

  deleteNotification(notificationId: string) {
    if (this.authService.isAdmin()) return;

    if (!this.authService.isAuthenticated()) {
      this.toastrService.warning('Please log in to delete notifications');
      return;
    }

    this.http.delete(`${this.apiUrl}notification/${notificationId}`).pipe(
      tap(() => this.fetchNotifications()),
      catchError(error => {
        console.error('deleteNotification Error:', error);
        if (error?.status !== 401 && error?.status !== 403) {
          this.toastrService.error('Failed to delete notification');
        }
        return of(null);
      })
    ).subscribe();
  }
}
