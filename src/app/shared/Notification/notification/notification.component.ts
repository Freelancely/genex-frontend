// notification.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from '@/shared/services/auth.service';

export interface ViewNotificationDTO {
    notificationId: string;
    title: string;
    message: string;
    dateAndTime: string;
    isRead: boolean;
}

@Component({
    selector: 'app-notification',
    templateUrl: 'notification.component.html',
    styleUrl: 'notification.component.scss',
    standalone: false,
})
export class NotificationComponent implements OnInit {
    notifications: ViewNotificationDTO[] = [];

    constructor(private http: HttpClient, private authService: AuthService) {}

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.fetchNotifications();
        }
    }

    fetchNotifications() {
        this.http.get<{ success: boolean; message: ViewNotificationDTO[] }>(
            `${environment.apiUrl}notification`
        ).subscribe({
            next: response => {
                if (response.success) this.notifications = response.message;
            },
            error: () => { /* interceptor handles auth errors */ }
        });
    }

    markAsRead(notificationId: string) {
        this.http.put(
            `${environment.apiUrl}notification/${notificationId}`, {}
        ).subscribe({
            next: () => this.fetchNotifications(),
            error: () => { /* interceptor handles auth errors */ }
        });
    }

    deleteNotification(notificationId: string) {
        this.http.delete(
            `${environment.apiUrl}notification/${notificationId}`
        ).subscribe({
            next: () => this.fetchNotifications(),
            error: () => { /* interceptor handles auth errors */ }
        });
    }
}
