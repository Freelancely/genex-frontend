import { TestBed } from '@angular/core/testing';

import { ShopFilterService } from './shop-filter.service';

describe('ShopFilterService', () => {
  let service: ShopFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShopFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
