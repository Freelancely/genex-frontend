import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shop-details-form',
  templateUrl: './shop-details-form.component.html',
  styleUrls: ['./shop-details-form.component.scss'],
  standalone: false
})
export class ShopDetailsFormComponent implements OnInit {
  @Input() productId!: string;
  @Output() onSubmitReview = new EventEmitter<{ starCount: number; description: string }>();

  public shopReviewForm!: FormGroup;
  public formSubmitted = false;
  public starCount: number = 0;

  constructor(private toastrService: ToastrService) {}

  ngOnInit() {
    this.shopReviewForm = new FormGroup({
      review: new FormControl(null, Validators.required)
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.shopReviewForm.valid && this.starCount > 0) {
      this.onSubmitReview.emit({
        starCount: this.starCount,
        description: this.shopReviewForm.get('review')?.value
      });
      this.shopReviewForm.reset();
      this.starCount = 0;
      this.formSubmitted = false;
    } else if (this.starCount === 0) {
      this.toastrService.error('Please provide a star rating');
    }
  }

  setStarRating(rating: number) {
    this.starCount = rating;
    setTimeout(() => {}, 0); // Force change detection
  }

  get review() { return this.shopReviewForm.get('review'); }
}
