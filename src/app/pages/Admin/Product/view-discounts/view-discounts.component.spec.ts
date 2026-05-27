import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDiscountsComponent } from './view-discounts.component';

describe('ViewDiscountsComponent', () => {
  let component: ViewDiscountsComponent;
  let fixture: ComponentFixture<ViewDiscountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDiscountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDiscountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
