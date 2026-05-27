import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

const XSRF_COOKIE = 'XSRF-TOKEN';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = name + '=';
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const c of cookies) {
    if (c.startsWith(prefix)) return decodeURIComponent(c.substring(prefix.length));
  }
  return null;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isToastrShown = false;

  constructor(
    private toastrService: ToastrService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // URLs we never want the session-expired toast for (login attempts, public reads).
    const authExcludedUrls = [
      '/api/user/login',
      '/api/user/register',
      '/api/user/forgot-password',
      '/api/shop',
      '/api/products',
      '/api/coupons',
      '/api/contact',
      '/api/home',
      '/api/electronics',
      '/api/product/view-products',
    ];

    let pathname = req.url;
    try {
      pathname = new URL(req.url, window.location.origin).pathname;
    } catch {
      // raw url
    }
    const isItExcluded = authExcludedUrls.some(url =>
      new RegExp(`^${url}(/.*)?$`).test(pathname)
    );

    // 1) Send the HttpOnly auth cookie on every request.
    let outgoing = req.clone({ withCredentials: true });

    // 2) Attach XSRF token on mutating verbs.
    if (MUTATING_METHODS.has(req.method)) {
      const xsrf = readCookie(XSRF_COOKIE);
      if (xsrf && !req.headers.has('X-XSRF-TOKEN')) {
        outgoing = outgoing.clone({ setHeaders: { 'X-XSRF-TOKEN': xsrf } });
      }
    }

    return next.handle(outgoing).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only treat a 401 as "session expired" when the user was actually logged
        // in. Anonymous users browsing pages that fire calls to auth-required
        // endpoints (e.g. the cart badge on /home) should NOT get bounced to
        // login — the page should just render without their cart/wishlist data.
        const hasSession = !!localStorage.getItem('role');

        if (error.status === 401 && !isItExcluded && hasSession) {
          if (!this.isToastrShown) {
            this.isToastrShown = true;
            this.toastrService.error('Session expired. Please login again.');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            this.router.navigate(['/pages/login']);
            setTimeout(() => {
              this.isToastrShown = false;
            }, 2000);
          }
        } else if (error.status !== 401 && error.status !== 403 && error.status !== 429) {
          this.toastrService.error(
            error.error?.message || 'An error occurred. Please try again.'
          );
        } else if (error.status === 429) {
          this.toastrService.warning('Too many requests. Please slow down.');
        }
        // 401/403 for anon users are swallowed silently — the calling component
        // can decide whether to render empty state or hide its UI.
        return throwError(() => error);
      })
    );
  }
}
