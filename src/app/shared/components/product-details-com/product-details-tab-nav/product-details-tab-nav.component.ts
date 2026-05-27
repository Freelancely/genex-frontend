import { Component, ElementRef, Renderer2, ViewChild, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { IProduct } from '@/shared/types/product-type';
import { ReviewService } from '../Service/review.service';

@Component({
  selector: 'app-product-details-tab-nav',
  templateUrl: './product-details-tab-nav.component.html',
  styleUrls: ['./product-details-tab-nav.component.scss'],
  standalone: false
})
export class ProductDetailsTabNavComponent implements OnInit {
  @ViewChild('navActive') navActive?: ElementRef;
  @ViewChild('productTabMarker') productTabMarker?: ElementRef;

  @Input() product!: IProduct;
  public averageRating: number = 0;
  public showReplyForm: boolean[] = [];
  public replyText: string[] = [];
  public isAdmin: boolean = false;

  constructor(
    private renderer: Renderer2,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkAdminStatus();
    if (this.product?.id) {
      this.reviewService.getReviews(this.product.id).subscribe({
        next: ({ average, reviews }) => {
          this.product.reviews = reviews;
          this.averageRating = average;
          this.showReplyForm = new Array(reviews.length).fill(false);
          this.replyText = new Array(reviews.length).fill('');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching reviews:', err);
          this.product.reviews = [];
          this.averageRating = 0;
          this.cdr.detectChanges();
        }
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.navActive?.nativeElement && this.productTabMarker?.nativeElement) {
        this.renderer.setStyle(
          this.productTabMarker.nativeElement,
          'left',
          `${this.navActive.nativeElement.offsetLeft}px`
        );
        this.renderer.setStyle(
          this.productTabMarker.nativeElement,
          'width',
          `${this.navActive.nativeElement.offsetWidth}px`
        );
      }
    }, 0);
  }

  handleActiveMarker(event: Event): void {
    if (this.productTabMarker?.nativeElement && event.target instanceof HTMLButtonElement) {
      this.renderer.setStyle(
        this.productTabMarker.nativeElement,
        'left',
        `${event.target.offsetLeft}px`
      );
      this.renderer.setStyle(
        this.productTabMarker.nativeElement,
        'width',
        `${event.target.offsetWidth}px`
      );
    }
  }

  submitReview(reviewData: { starCount: number; description: string }) {
    if (this.product?.id) {
      this.reviewService.addReview({
        productId: this.product.id,
        starCount: reviewData.starCount,
        description: reviewData.description,
        isAdmin: this.isAdmin
      }).subscribe({
        next: (response) => {
          this.refreshReviews();
        },
        error: (err) => {
          console.error('Error submitting review:', err);
        }
      });
    }
  }

  toggleReplyForm(index: number): void {
    if (this.isAdmin) {
      this.showReplyForm[index] = !this.showReplyForm[index];
      this.cdr.detectChanges();
    }
  }

  submitReply(reviewId: string | undefined, index: number): void {
    if (!this.isAdmin) return;
    if (!reviewId) {
      console.error('Review ID is undefined');
      return;
    }
    if (this.replyText[index].trim()) {
      this.reviewService.addReply({
        reviewId,
        description: this.replyText[index],
        isAdmin: this.isAdmin
      }).subscribe({
        next: (response) => {
          this.replyText[index] = '';
          this.showReplyForm[index] = false;
          this.refreshReviews();
        },
        error: (err) => {
          console.error('Error submitting reply:', err);
        }
      });
    }
  }

  private checkAdminStatus(): void {
    const role = localStorage.getItem('role');
    this.isAdmin = role === 'Admin' || role === 'SuperAdmin';
  }

  private refreshReviews(): void {
    if (this.product?.id) {
      this.reviewService.getReviews(this.product.id).subscribe({
        next: ({ average, reviews }) => {
          this.product.reviews = reviews;
          this.averageRating = average;
          this.showReplyForm = new Array(reviews.length).fill(false);
          this.replyText = new Array(reviews.length).fill('');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error refreshing reviews:', err);
          this.product.reviews = [];
          this.averageRating = 0;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
