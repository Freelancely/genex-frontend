import { Component, OnInit } from '@angular/core';
import { CartService } from '@/shared/services/cart.service';
import { AuthService } from '@/shared/services/auth.service';

@Component({
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss'],
  standalone: false
})
export class CartSidebarComponent implements OnInit {
  constructor(
    public cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.cartService.getCartItems().subscribe({
        error: () => { /* fallback handled in service */ }
      });
    } else {
      this.cartService.clear_cart();
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
