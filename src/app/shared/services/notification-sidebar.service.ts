import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationSidebarService {
  public isSidebarOpen = new BehaviorSubject<boolean>(false);

  getSidebarState() {
    return this.isSidebarOpen.asObservable();
  }

  handleOpenNotificationSidebar() {
    this.isSidebarOpen.next(true);
  }

  handleCloseNotificationSidebar() {
    this.isSidebarOpen.next(false);
  }

  toggleSidebar() {
    this.isSidebarOpen.next(!this.isSidebarOpen.value);
  }
}
