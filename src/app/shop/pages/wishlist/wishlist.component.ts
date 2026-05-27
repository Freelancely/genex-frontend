import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '@/types/product-type';
import { CartService } from '@/shared/services/cart.service';
import { WishlistService } from '@/shared/services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  standalone: false
})
export class WishlistComponent implements OnInit {
  public wishlistItems!: Observable<IProduct[]>;

  constructor(
    public wishlistService: WishlistService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    this.wishlistItems = this.wishlistService.getWishlistUpdates(); // Use getWishlistUpdates for real-time updates
  }
}
