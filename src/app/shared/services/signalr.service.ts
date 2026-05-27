// signalr.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service'; // Adjust path
import { NotificationService } from './notification.service'; // Adjust path

export interface ViewNotificationDTO {
    notificationId: string;
    title: string;
    message: string;
    dateAndTime: string;
    isRead: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private hubConnection: signalR.HubConnection;

    constructor(
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private notificationService: NotificationService
    ) {
        // Auth flows over the HttpOnly `genex_token` cookie. The browser sends it
        // automatically because withCredentials is true. The backend JwtBearer
        // middleware reads from the cookie when there is no Authorization header
        // or access_token query param.
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(environment.signalRHubUrl, {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();

        // Handle logout
        this.authService.onLogout().subscribe(() => {
            this.hubConnection.stop();
        });

        // Listen for notifications
        this.hubConnection.on('ReceiveNotification', (notification: ViewNotificationDTO) => {
            this.snackBar.open(`${notification.title}: ${notification.message}`, 'Close', { duration: 5000 });
            this.notificationService.addNotification(notification);
        });

        // Start connection
        this.startConnection();
    }

    private startConnection() {
        if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
            this.hubConnection
                .start()
                .then(() => console.log('SignalR Connected to', environment.signalRHubUrl))
                .catch(err => console.error('Error connecting to SignalR:', err));
        }
    }

    public sendNotification(title: string, message: string): void {
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.hubConnection.invoke('SendNotification', userId, title, message)
                .catch(err => console.error('Error sending notification:', err));
        } else {
            console.error('User ID not found in localStorage');
        }
    }

    public isConnected(): boolean {
        return this.hubConnection.state === signalR.HubConnectionState.Connected;
    }
}
