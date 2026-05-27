import { Component, OnInit } from '@angular/core';
import { IProduct } from '@/types/product-type';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ShopService } from 'src/app/shop/services/shop.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: false
})
export class SearchComponent implements OnInit {
  public products: IProduct[] = [];
  public searchText: string = '';
  public productType: string = '';
  public perView: number = 9;
  public sortBy: string = '';
  public loading: boolean = false;
  public error: string | null = null;

  public selectOptions = [
    { value: 'asc', text: 'Price: Low to High' },
    { value: 'desc', text: 'Price: High to Low' },
    { value: '', text: 'Default Sorting' },
    { value: 'on-sale', text: 'On Sale' }
  ];

  changeFilterSelect(selectedOption: { value: string; text: string }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: selectedOption.value || null },
      queryParamsHandling: 'merge'
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products');
    });
  }

  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchText = params['searchText'] || '';
      this.productType = params['productType'] || '';
      this.sortBy = params['sortBy'] || '';
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    const sortParam = this.sortBy === 'on-sale' || !this.sortBy ? '' : this.sortBy;

    this.shopService.getProducts({
      pageNumber: 1,
      pageSize: 60,
      productName: this.searchText || '',
      sortBy: sortParam
    }).subscribe({
      next: (res) => {
        let items = res.products;
        if (this.sortBy === 'on-sale') {
          items = items.filter((p) => p.discount > 0);
        }
        this.products = items;
        this.loading = false;
      },
      error: (err) => {
        this.products = [];
        this.error = err?.message || 'Could not load products.';
        this.loading = false;
      }
    });
  }

  handlePerView(): void {
    this.perView += 6;
  }
}
