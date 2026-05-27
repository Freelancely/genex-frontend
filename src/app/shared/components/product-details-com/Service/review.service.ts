import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IReview } from '../../../../shared/types/product-type';

interface AddReviewRequest {
  productId: string;
  starCount: number;
  description: string;
  isAdmin?: boolean;
}

interface AddReviewResponse {
  success: boolean;
  message: string;
}

interface AddReplyRequest {
  reviewId: string;
  description: string;
  isAdmin?: boolean;
}

interface AddReplyResponse {
  success: boolean;
  message: string;
}

interface GetReviewsResponse {
  success: boolean;
  message: {
    average: number;
    reviewList: {
      reviewId: string;
      starCount: number;
      username: string;
      reviewDate: string;
      description: string;
      isAdmin?: boolean; // Include isAdmin for reviews
      responses?: {
        username: string;
        responseDate: string;
        description: string;
        isAdmin?: boolean;
      }[];
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  addReview(review: AddReviewRequest): Observable<AddReviewResponse> {
    const role = localStorage.getItem('role');
    review.isAdmin = role === 'Admin' || role === 'SuperAdmin';

    return this.http.post<AddReviewResponse>(`${this.apiUrl}review/add-review`, review).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to add review');
        }
        return response;
      }),
      catchError(err => {
        console.error('Error adding review:', err);
        return throwError(() => new Error('Failed to add review'));
      })
    );
  }

  addReply(reply: AddReplyRequest): Observable<AddReplyResponse> {
    const role = localStorage.getItem('role');
    reply.isAdmin = role === 'Admin' || role === 'SuperAdmin';

    return this.http.post<AddReplyResponse>(`${this.apiUrl}review/add-reply`, reply).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to add reply');
        }
        return response;
      }),
      catchError(err => {
        console.error('Error adding reply:', err);
        return throwError(() => new Error('Failed to add reply'));
      })
    );
  }

  getReviews(productId: string): Observable<{ average: number; reviews: IReview[] }> {
    return this.http.get<GetReviewsResponse>(`${this.apiUrl}review/get-reviews/${productId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(typeof response.message === 'string' ? response.message : 'Failed to fetch reviews');
        }
        const currentUserId = localStorage.getItem('userId');
        return {
          average: response.message.average,
          reviews: response.message.reviewList.map(review => ({
            reviewId: review.reviewId,
            rating: review.starCount,
            name: review.username,
            email: '',
            date: review.reviewDate,
            review: review.description,
            adminResponse: null,
            responses: review.responses?.map(response => ({
              username: response.username,
              responseDate: response.responseDate,
              description: response.description,
              isAdmin: response.isAdmin ?? false // Use backend-provided isAdmin, fallback to false
            })) || [],
            isAdmin: review.isAdmin ?? false // Use backend-provided isAdmin, fallback to false
          }))
        };
      }),
      catchError(err => {
        console.error(`Error fetching reviews for product ${productId}:`, err);
        return throwError(() => new Error('Failed to fetch reviews'));
      })
    );
  }
}
