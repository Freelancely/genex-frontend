import { TestBed } from '@angular/core/testing';

import { ElectronicsService } from './electronics.service';

describe('ElectronicsService', () => {
  let service: ElectronicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectronicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
