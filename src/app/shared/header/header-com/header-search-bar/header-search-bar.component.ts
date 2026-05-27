import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { IProduct } from '@/types/product-type';
import { ShopService } from 'src/app/shop/services/shop.service';

@Component({
  selector: 'app-header-search-bar',
  templateUrl: './header-search-bar.component.html',
  styleUrls: ['./header-search-bar.component.scss'],
  standalone: false,
})
export class HeaderSearchBarComponent implements OnInit, OnDestroy {
  public searchText = '';
  public searchSuggestions: IProduct[] = [];
  public showSuggestions = false;
  public suggestionsLoading = false;

  private readonly searchInput$ = new Subject<string>();
  private searchSub?: Subscription;
  private blurTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly shopService: ShopService,
    private readonly router: Router,
    private readonly host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.searchSub = this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          const trimmed = term.trim();
          if (!trimmed) {
            return of({ products: [] as IProduct[] });
          }
          return this.shopService
            .getProducts({ pageNumber: 1, pageSize: 6, productName: trimmed })
            .pipe(catchError(() => of({ products: [] as IProduct[] })));
        }),
      )
      .subscribe((res: { products: IProduct[] }) => {
        this.searchSuggestions = res.products || [];
        this.suggestionsLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    if (this.blurTimer) clearTimeout(this.blurTimer);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value;
    const hasText = value.trim().length > 0;
    this.showSuggestions = hasText;
    // Flip to loading immediately so we don't flash an empty-state
    // during the 300ms debounce window.
    this.suggestionsLoading = hasText;
    if (!hasText) {
      this.searchSuggestions = [];
    }
    this.searchInput$.next(value);
  }

  onSearchFocus(): void {
    if (this.searchText.trim().length > 0) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    // Delay so a click on a suggestion can resolve before we hide.
    this.blurTimer = setTimeout(() => (this.showSuggestions = false), 150);
  }

  selectSuggestion(): void {
    this.showSuggestions = false;
  }

  clearSearch(): void {
    this.searchText = '';
    this.searchSuggestions = [];
    this.showSuggestions = false;
    this.suggestionsLoading = false;
  }

  handleSearchSubmit(): void {
    const term = this.searchText.trim();
    if (!term) return;
    this.showSuggestions = false;
    this.router.navigate(['/pages/search'], { queryParams: { searchText: term } });
  }

  // Close dropdown if user clicks outside this component.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showSuggestions) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.showSuggestions = false;
    }
  }

  // Close dropdown on Escape.
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showSuggestions = false;
  }
}
