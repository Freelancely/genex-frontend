import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { IProduct } from '../../shared/types/product-type';
import { ShopService } from '../services/shop.service';
import { ShopFilterService } from '../services/shop-filter.service';

@Component({
  selector: 'app-shop-area',
  templateUrl: './shop-area.component.html',
  styleUrls: ['./shop-area.component.scss'],
  standalone: false
})
export class ShopAreaComponent {
  @Input() listStyle: boolean = false;
  @Input() full_width: boolean = false;
  @Input() shop_1600: boolean = false;
  @Input() shop_right_side: boolean = false;
  @Input() shop_no_side: boolean = false;

  public products: IProduct[] = [];
  public displayedProducts: IProduct[] = [];
  public loading: boolean = true;
  public minPrice: number = 0;
  public maxPrice: number = 1000000; // Default fallback value
  public niceSelectOptions = [
    { value: 'asc', text: 'Price: Low to High' },
    { value: 'desc', text: 'Price: High to Low' },
    { value: '', text: 'Default Sorting' }
  ];
  public defaultSortIndex: number = 0;
  public tags: string[] = [];
  public category: string | null = null;
  public subcategory: string | null = null;
  public status: string | null = null;
  public pageNo: number = 1;
  public pageSize: number = 9;
  public paginate: any = {};
  public sortBy: string = 'asc';
  public mobileSidebar: boolean = false;

  activeTab: string = this.listStyle ? 'list' : 'grid';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopService: ShopService,
    private shopFilterService: ShopFilterService,
    private viewScroller: ViewportScroller
  ) {
    this.route.queryParams.subscribe(params => {
      this.minPrice = params['minPrice'] ? +params['minPrice'] : this.minPrice;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : this.maxPrice;
      this.category = params['category'] || null;
      this.subcategory = params['subcategory'] ? params['subcategory'].toLowerCase().split(' ').join('-') : null;
      this.status = params['status'] ? params['status'].toLowerCase().split(' ').join('-') : null;
      this.pageNo = params['page'] ? +params['page'] : this.pageNo;
      this.sortBy = params['sortBy'] ? params['sortBy'] : 'asc';

      // Set defaultSortIndex based on sortBy
      this.defaultSortIndex = this.niceSelectOptions.findIndex(o => o.value === this.sortBy);

      const filters = {
        pageNumber: this.pageNo,
        pageSize: this.pageSize,
        categoryName: this.category || '',
        subCategoryName: this.subcategory || '',
        productName: '',
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        hasDiscount: undefined,
        inStockOnly: this.status === 'in-stock' ? true : this.status === 'out-of-stock' ? false : undefined,
        attributeFilters: {},
        sortBy: this.sortBy
      };


      this.loading = true;
      this.shopService.getProducts(filters).subscribe({
        next: (response) => {
          this.products = response.products;
          this.paginate = response.pagination;
          this.tags = [...new Set(response.products.flatMap(p => p.tags ?? []))];
          // Set minPrice and maxPrice from API response
          this.minPrice = response.lowestPrice;
          this.maxPrice = response.highestprice;
          this.applyFrontendSorting(this.sortBy);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    });
  }

  ngOnInit() {
    this.activeTab = this.listStyle ? 'list' : 'grid';
  }

  handleActiveTab(tab: string) {
    this.activeTab = tab;
  }

  changeFilterSelect(selectedOption: { value: string; text: string }) {
    this.sortBy = selectedOption.value;
    this.defaultSortIndex = this.niceSelectOptions.findIndex(o => o.value === this.sortBy);
    this.applyFrontendSorting(this.sortBy);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: this.sortBy || null },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products');
    });
  }

  updateFilter(tags: any) {
    tags.page = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: tags,
      queryParamsHandling: 'merge',
      skipLocationChange: false
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products');
    });
  }

  applyFrontendSorting(sortBy: string) {
    this.displayedProducts = [...this.products];
    if (sortBy === 'asc') {
      this.displayedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'desc') {
      this.displayedProducts.sort((a, b) => b.price - a.price);
    } else {
      this.displayedProducts.sort((a, b) => a.id.localeCompare(b.id));
    }
  }

  setPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products');
    });
  }

  handleResetFilter() {
    this.shopService.getProducts({}).subscribe(response => {
      this.minPrice = response.lowestPrice;
      this.maxPrice = response.highestprice;
      this.pageNo = 1;
      this.category = null;
      this.subcategory = null;
      this.status = null;
      this.sortBy = 'asc';
      this.defaultSortIndex = this.niceSelectOptions.findIndex(o => o.value === this.sortBy);
      this.router.navigate(['shop']).then(() => {
        this.applyFrontendSorting(this.sortBy);
      });
    });
  }
}
