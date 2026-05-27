import { Pipe, PipeTransform } from '@angular/core';
import { ViewNotificationDTO } from '@/shared/services/signalr.service';

@Pipe({
  name: 'unreadNotifications'
})
export class UnreadNotificationsPipe implements PipeTransform {
  transform(notifications: ViewNotificationDTO[]): number {
    return notifications.filter(notification => !notification.isRead).length;
  }
}
