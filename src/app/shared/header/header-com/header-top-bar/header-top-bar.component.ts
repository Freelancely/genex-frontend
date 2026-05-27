import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@/shared/services/auth.service';
import { CartService } from '@/shared/services/cart.service';
import { ProfileService, UserProfile } from '@/shared/components/product-details-com/Service/profile.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-header-top-bar',
  templateUrl: './header-top-bar.component.html',
  styleUrls: ['./header-top-bar.component.scss'],
  standalone: false
})
export class HeaderTopBarComponent implements OnInit, OnDestroy {
  public isActive: string = '';
  public cartCount: number = 0;
  public profile: UserProfile | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private profileService: ProfileService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.cartService.cartProducts$.subscribe(products => {
        this.cartCount = products.reduce((sum, item) => sum + (item.orderQuantity || 0), 0);
      })
    );

    this.subscriptions.push(
      this.profileService.profile$.subscribe(profile => {
        this.profile = profile;
      })
    );

    if (this.isLoggedIn() && !this.profileService.getCurrentProfile()) {
      this.profileService.refreshProfile().subscribe({ error: () => {} });
    }

    this.subscriptions.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        this.isActive = '';
      })
    );

    this.cartService.refreshCartItems().subscribe();
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  handleActive(type: string, event?: Event): void {
    event?.stopPropagation();
    this.isActive = type === this.isActive ? '' : type;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isActive) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isActive = '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isActive = '';
  }

  getInitials(): string {
    const first = this.profile?.firstname?.trim()?.[0] || '';
    const last = this.profile?.lastname?.trim()?.[0] || '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || (this.profile?.email?.[0]?.toUpperCase() ?? 'U');
  }

  logout(): void {
    this.profileService.clearProfile();
    this.authService.logout();
    this.isActive = '';
    this.router.navigate(['/pages/login']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
