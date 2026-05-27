import { TestBed } from '@angular/core/testing';

import { NotificationSidebarService } from './notification-sidebar.service';

describe('NotificationSidebarService', () => {
  let service: NotificationSidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationSidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
