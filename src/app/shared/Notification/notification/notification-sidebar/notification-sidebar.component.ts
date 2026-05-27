import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@/shared/services/notification.service';
import { NotificationSidebarService } from '@/shared/services/notification-sidebar.service';
import { ViewNotificationDTO } from '@/shared/services/signalr.service';

@Component({
  selector: 'app-notification-sidebar',
  templateUrl: './notification-sidebar.component.html',
  styleUrls: ['./notification-sidebar.component.scss'],
  standalone: false
})
export class NotificationSidebarComponent implements OnInit {
  notifications: ViewNotificationDTO[] = [];
  isSidebarOpen = false;

  constructor(
    private notificationService: NotificationService,
    private notificationSidebarService: NotificationSidebarService
  ) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
    this.notificationSidebarService.getSidebarState().subscribe(state => {
      this.isSidebarOpen = state;
    });
  }

  toggleSidebar() {
    this.notificationSidebarService.toggleSidebar();
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  deleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId);
  }
}
