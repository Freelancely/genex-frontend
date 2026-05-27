import { Component, Output, Input, EventEmitter, Inject, PLATFORM_ID, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-price-filter',
  templateUrl: './price-filter.component.html',
  styleUrls: ['./price-filter.component.scss'],
  standalone: false
})
export class PriceFilterComponent implements OnInit, OnChanges {
  @Output() priceFilter: EventEmitter<{ minPrice: number; maxPrice: number }> = new EventEmitter();
  @Input() min: number = 0;
  @Input() max: number = 1000000;

  // Bounds from API — the range the user is allowed to filter within
  public apiMin: number = 0;
  public apiMax: number = 1000000;

  // Values bound to the inputs (may be empty strings while the user is typing)
  public minInput: string = '';
  public maxInput: string = '';

  public errorMessage: string | null = null;
  public loadingBounds: boolean = false;
  public isBrowser: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private shopService: ShopService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
    }
  }

  ngOnInit(): void {
    this.apiMin = this.min;
    this.apiMax = this.max;
    this.syncInputsFromBounds();
    this.fetchBounds();

    // Pre-fill from existing query params, if any
    const qp = this.route.snapshot.queryParamMap;
    const qMin = qp.get('minPrice');
    const qMax = qp.get('maxPrice');
    if (qMin !== null) this.minInput = qMin;
    if (qMax !== null) this.maxInput = qMax;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['min'] || changes['max']) {
      this.apiMin = this.min;
      this.apiMax = this.max;
      if (!this.minInput) this.minInput = String(this.apiMin);
      if (!this.maxInput) this.maxInput = String(this.apiMax);
    }
  }

  private fetchBounds(): void {
    this.loadingBounds = true;
    this.shopService.getProducts({}).subscribe({
      next: (response) => {
        this.apiMin = Math.max(0, Math.floor(response.lowestPrice ?? 0));
        this.apiMax = Math.max(this.apiMin, Math.ceil(response.highestprice ?? 0));
        this.syncInputsFromBounds();
        this.loadingBounds = false;
      },
      error: () => {
        this.loadingBounds = false;
      }
    });
  }

  private syncInputsFromBounds(): void {
    const qp = this.route.snapshot.queryParamMap;
    if (!qp.get('minPrice')) this.minInput = String(this.apiMin);
    if (!qp.get('maxPrice')) this.maxInput = String(this.apiMax);
  }

  // Allow only digits — strip commas, letters, decimals, spaces on the fly
  onInput(field: 'min' | 'max', raw: string): void {
    const cleaned = (raw ?? '').replace(/[^0-9]/g, '');
    if (field === 'min') this.minInput = cleaned;
    else this.maxInput = cleaned;
    this.validate();
  }

  // Block invalid keys at source (commas, dots, e, +/-)
  onKeydown(event: KeyboardEvent): void {
    const allowedControl = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedControl.includes(event.key)) return;
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent, field: 'min' | 'max'): void {
    const text = event.clipboardData?.getData('text') ?? '';
    const cleaned = text.replace(/[^0-9]/g, '');
    event.preventDefault();
    if (field === 'min') this.minInput = cleaned;
    else this.maxInput = cleaned;
    this.validate();
  }

  private parse(value: string): number | null {
    if (value === '' || value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private validate(): boolean {
    const min = this.parse(this.minInput);
    const max = this.parse(this.maxInput);

    if (min === null || max === null) {
      this.errorMessage = 'Enter both min and max values.';
      return false;
    }
    if (min < this.apiMin) {
      this.errorMessage = `Minimum cannot be less than Npr.${this.apiMin}.`;
      return false;
    }
    if (max > this.apiMax) {
      this.errorMessage = `Maximum cannot exceed Npr.${this.apiMax}.`;
      return false;
    }
    if (min > max) {
      this.errorMessage = 'Min price must be less than or equal to max price.';
      return false;
    }
    this.errorMessage = null;
    return true;
  }

  applyFilter(): void {
    if (!this.validate()) return;

    const price = {
      minPrice: Number(this.minInput),
      maxPrice: Number(this.maxInput)
    };

    this.priceFilter.emit(price);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: price,
      queryParamsHandling: 'merge',
      skipLocationChange: false
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products');
    });
  }

  reset(): void {
    this.minInput = String(this.apiMin);
    this.maxInput = String(this.apiMax);
    this.errorMessage = null;
    this.applyFilter();
  }
}
