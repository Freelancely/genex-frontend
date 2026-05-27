import { TestBed } from '@angular/core/testing';

import { ElectronicOfferProductsService } from './electronic-offer-products.service';

describe('ElectronicOfferProductsService', () => {
  let service: ElectronicOfferProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectronicOfferProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
