// add-coupon.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CouponService, Coupon } from '../Services/coupon.service';

@Component({
  selector: 'app-add-coupon',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.scss']
})
export class AddCouponComponent implements OnInit {
  couponForm: FormGroup;
  isEditMode = false;
  errorMessage = signal<string | null>(null);
  selectedFile: File | null = null;
  couponId: string | null = null; // Store coupon ID for edit mode

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private couponService: CouponService
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      CouponName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      discountPercent: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      couponImage: [''] // No required validator, as image is optional
    });
  }

  ngOnInit() {
    const state = history.state;
    if (state.coupon) {
      this.isEditMode = true;
      this.couponId = state.coupon.id; // Store the coupon ID
      this.couponForm.patchValue({
        couponCode: state.coupon.couponCode,
        CouponName: state.coupon.CouponName,
        startDate: this.formatDateForInput(state.coupon.startDate),
        endDate: this.formatDateForInput(state.coupon.endDate),
        discountPercent: state.coupon.discountPercent,
        couponImage: state.coupon.couponImageUrl || ''
      });
    }
  }

  formatDateForInput(date: string): string {
    return new Date(date).toISOString().slice(0, 16);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.couponForm.patchValue({ couponImage: this.selectedFile.name });
      this.couponForm.get('couponImage')?.markAsTouched();
    } else {
      this.couponForm.patchValue({ couponImage: '' });
    }
  }

  navigateToCoupons() {
    this.router.navigate(['/pages/admin/view-coupons']);
  }

  onSubmit() {
    if (this.couponForm.valid) {
      const formValue = this.couponForm.value;
      const formData = new FormData();
      formData.append('CouponCode', formValue.couponCode);
      formData.append('CouponName', formValue.CouponName);
      formData.append('StartDate', new Date(formValue.startDate).toISOString());
      formData.append('EndDate', new Date(formValue.endDate).toISOString());
      formData.append('DiscountPercent', formValue.discountPercent.toString());
      if (this.selectedFile) {
        formData.append('CouponImage', this.selectedFile);
      } else if (this.isEditMode && formValue.couponImage) {
        formData.append('CouponImageUrl', formValue.couponImage);
      } else {
        formData.append('CouponImage', ''); // Send empty string if no image
      }

      const serviceCall = this.isEditMode && this.couponId
        ? this.couponService.updateCoupon(this.couponId, formData)
        : this.couponService.addCoupon(formData);

      serviceCall.subscribe({
        next: (response) => {
          alert(this.isEditMode ? 'Coupon updated successfully!' : 'Coupon saved successfully!');
          this.navigateToCoupons();
        },
        error: (error) => {
          this.errorMessage.set('Failed to save coupon: ' + error.error?.message || error.message);
          console.error('Error saving coupon:', error.error?.message || error.message);
        }
      });
    } else {
      this.couponForm.markAllAsTouched();
      Object.keys(this.couponForm.controls).forEach(control => {
        const errors = this.couponForm.get(control)?.errors;
        if (errors) {
        }
      });
      alert('Please fill all required fields correctly.');
    }
  }

  cancel() {
    this.navigateToCoupons();
  }
}
