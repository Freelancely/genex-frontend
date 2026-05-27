import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ShopFilterService } from '../../services/shop-filter.service';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
  standalone: false
})
export class CategoryFilterComponent implements OnInit {
  public categoryData: { categoryId: string; categoryName: string; productCount: number }[] = [];
  activeQuery: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private shopFilterService: ShopFilterService
  ) {}

  ngOnInit(): void {
    this.shopFilterService.getCategories().subscribe(categories => {
      this.categoryData = categories;
    });
    this.route.queryParams.subscribe((queryParams) => {
      this.activeQuery = queryParams['category'] || '';
    });
  }

  handleCategoryRoute(categoryName: string): void {
    const newCategory = categoryName; // Use original case for URL
    const queryParams: Params = {
      category: newCategory === this.activeQuery ? null : newCategory
    };

    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        skipLocationChange: false
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products');
      });
  }
}
