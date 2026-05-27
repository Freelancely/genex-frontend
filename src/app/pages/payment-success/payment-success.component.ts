import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '@/shared/services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {

  constructor(public router: Router, private cartService: CartService) { }

  ngOnInit(): void {
    // Clear cart on successful payment
    this.cartService.clear_cart();
    // Redirect to orders page after a delay
    setTimeout(() => {
      this.router.navigate(['/profile/orders']);
    }, 3000);
  }
}
