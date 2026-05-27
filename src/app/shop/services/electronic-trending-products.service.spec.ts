import { TestBed } from '@angular/core/testing';

import { ElectronicTrendingProductsService } from './electronic-trending-products.service';

describe('ElectronicTrendingProductsService', () => {
  let service: ElectronicTrendingProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectronicTrendingProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
