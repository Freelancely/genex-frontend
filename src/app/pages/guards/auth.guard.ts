import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private check(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/pages/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const allowedRoles = route.data?.['roles'] as string[] | undefined;
    const ok = allowedRoles && allowedRoles.length > 0
      ? this.authService.hasAnyRole(allowedRoles)
      : this.authService.isAdminLike();

    if (!ok) {
      this.router.navigate(['/pages/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    return true;
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.check(next, state);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.check(childRoute, state);
  }
}
