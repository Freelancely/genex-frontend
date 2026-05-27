import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DiscountsService } from '../../Services/discounts.service';

interface Discount {
  discountPercentage: number;
  validFrom: string;
  validTill: string;
}

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class DiscountsComponent {
  discount: Discount = {
    discountPercentage: 0,
    validFrom: '',
    validTill: ''
  };
  validFrom: string = '';
  validTill: string = '';
  errorMessage: string = '';

  constructor(
    private discountsService: DiscountsService,
    private toastrService: ToastrService
  ) {}

  onSubmit() {
  if (this.discount.discountPercentage < 0 || this.discount.discountPercentage > 100) {
    this.errorMessage = 'Discount percentage must be between 0 and 100';
    this.toastrService.error(this.errorMessage);
    return;
  }

  const discountData: Discount = {
    discountPercentage: this.discount.discountPercentage,
    validFrom: new Date(this.validFrom).toISOString(),
    validTill: new Date(this.validTill).toISOString()
    // discountId is optional, so it’s fine to omit it
  };

  this.discountsService.addDiscount(discountData).subscribe({
    next: (response) => {
      if (response.success) {
        this.toastrService.success('Discount added successfully');
        this.resetForm();
      } else {
        this.errorMessage = 'Failed to add discount';
        this.toastrService.error(this.errorMessage);
      }
    },
    error: (err) => {
      this.errorMessage = 'Error adding discount';
      this.toastrService.error(this.errorMessage);
      console.error('addDiscount Error:', err);
    }
  });
}

  resetForm() {
    this.discount = {
      discountPercentage: 0,
      validFrom: '',
      validTill: ''
    };
    this.validFrom = '';
    this.validTill = '';
    this.errorMessage = '';
  }
}
