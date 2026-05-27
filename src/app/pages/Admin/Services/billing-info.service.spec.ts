import { TestBed } from '@angular/core/testing';

import { BillingInfoService } from './billing-info.service';

describe('BillingInfoService', () => {
  let service: BillingInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillingInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
