import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { IProduct } from '@/types/product-type';
import { environment } from 'src/environments/environment';
import { AuthService } from '@/shared/services/auth.service'; // Import AuthService

interface WishlistItem {
  wishlistId: string;
  productId: string;
  imageUrl: string;
  productName: string;
  productPrice: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: T;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = environment.apiUrl;
  private wishlistCache$: Observable<IProduct[]> | null = null;
  private wishlistSubject = new BehaviorSubject<IProduct[]>([]);

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private authService: AuthService // Inject AuthService
  ) {
    this.loadWishlist(); // Initialize wishlist on service creation
  }

  private loadWishlist() {
    // Skip if user is admin
    if (this.authService.isAdmin()) {
      this.wishlistSubject.next([]); // Set empty wishlist for admins
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.wishlistSubject.next([]);
      return;
    }

    this.http.get<ApiResponse<WishlistItem[]>>(`${this.apiUrl}wishlist`).pipe(
      tap(response => {
        if (response.success) {
          const items = response.message.map(item => ({
            id: item.productId,
            img: item.imageUrl,
            title: item.productName,
            price: item.productPrice,
            category: { name: '' },
            status: '',
            quantity: 0,
            discount: 0,
            wishlistId: item.wishlistId
          } as IProduct));
          this.wishlistSubject.next(items); // Update BehaviorSubject with fetched items
        } else {
          this.wishlistSubject.next([]);
        }
      }),
      catchError(error => {
        console.error('loadWishlist Error:', error);
        // The HTTP interceptor already surfaces real network/server errors.
        this.wishlistSubject.next([]);
        return throwError(() => new Error(error));
      })
    ).subscribe();
  }

  getWishlistProducts(): Observable<IProduct[]> {
    // Skip if user is admin
    if (this.authService.isAdmin()) {
      this.wishlistSubject.next([]);
      return of([]); // Return empty array for admins
    }

    if (!this.authService.isAuthenticated()) {
      this.wishlistSubject.next([]);
      return of([]);
    }

    if (!this.wishlistCache$) {
      this.wishlistCache$ = this.http.get<ApiResponse<WishlistItem[]>>(`${this.apiUrl}wishlist`).pipe(
        map(response => {
          if (response.success) {
            const items = response.message.map(item => ({
              id: item.productId,
              img: item.imageUrl,
              title: item.productName,
              price: item.productPrice,
              category: { name: '' },
              status: '',
              quantity: 0,
              discount: 0,
              wishlistId: item.wishlistId
            } as IProduct));
            this.wishlistSubject.next(items); // Update BehaviorSubject
            return items;
          }
          this.wishlistSubject.next([]);
          return [];
        }),
        catchError(error => {
          console.error('getWishlistProducts Error:', error);
          this.wishlistSubject.next([]);
          return throwError(() => new Error(error));
        }),
        shareReplay(1)
      );
    }
    return this.wishlistCache$;
  }

  getWishlistUpdates(): Observable<IProduct[]> {
    return this.wishlistSubject.asObservable();
  }

  addWishlistProduct(product: IProduct): Observable<boolean> {
    // Skip if user is admin
    if (this.authService.isAdmin()) {
      return of(false); // Return false for admins
    }

    if (!this.authService.isAuthenticated()) {
      this.toastrService.warning('Please log in to add items to your wishlist');
      return of(false);
    }

    const payload = {
      productId: product.id,
      imageUrl: product.img,
      productName: product.title,
      productPrice: product.price
    };

    return this.http.post<ApiResponse<string>>(`${this.apiUrl}wishlist`, payload).pipe(
      map(response => {
        if (response.success) {
          this.toastrService.success(`${product.title} added to wishlist`);
          this.wishlistCache$ = null; // Invalidate cache
          this.loadWishlist(); // Refresh wishlist
          return true;
        }
        this.toastrService.error(`${product.title} failed to add to wishlist`);
        return false;
      }),
      catchError(error => {
        console.error('addWishlistProduct Error:', error);
        if (error?.status !== 401 && error?.status !== 403) {
          this.toastrService.error(`${product.title} failed to add to wishlist: ${error.message}`);
        }
        return throwError(() => new Error(error));
      })
    );
  }

  removeWishlist(wishlistId: string, productTitle: string): Observable<boolean> {
    // Skip if user is admin
    if (this.authService.isAdmin()) {
      return of(false); // Return false for admins
    }

    if (!this.authService.isAuthenticated()) {
      this.toastrService.warning('Please log in to manage your wishlist');
      return of(false);
    }

    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}wishlist/${wishlistId}`).pipe(
      map(response => {
        if (response.success) {
          this.toastrService.success(`${productTitle} removed from wishlist`);
          this.wishlistCache$ = null; // Invalidate cache
          this.loadWishlist(); // Refresh wishlist
          return true;
        }
        this.toastrService.error(`Failed to remove ${productTitle} from wishlist`);
        return false;
      }),
      catchError(error => {
        console.error('removeWishlist Error:', error);
        if (error?.status !== 401 && error?.status !== 403) {
          this.toastrService.error(`Failed to remove ${productTitle} from wishlist: ${error.message}`);
        }
        return throwError(() => new Error(error));
      })
    );
  }

  isItemInWishlist(productId: string): Observable<boolean> {
    // Skip if user is admin
    if (this.authService.isAdmin()) {
      return of(false); // Return false for admins
    }

    return this.getWishlistUpdates().pipe(
      map(products => products.some(p => p.id === productId)),
      catchError(() => of(false))
    );
  }
}
