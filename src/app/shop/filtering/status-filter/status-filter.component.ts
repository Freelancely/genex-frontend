// src/app/shop/product/widget/status-filter/status-filter.component.ts
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss'],
  standalone: false
})
export class StatusFilterComponent {
  status: string[] = ['In Stock', 'Out of Stock'];
  activeQuery: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.activeQuery = queryParams['status'] || '';
    });
  }

  handleStatusRoute(status: string): void {
    const newStatus = status.toLowerCase().split(' ').join('-');
    const queryParams: Params = {
      status: newStatus === this.activeQuery ? null : newStatus
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
