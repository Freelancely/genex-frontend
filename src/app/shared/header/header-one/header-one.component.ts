import { Component, HostListener } from '@angular/core';
import { CartService } from '@/shared/services/cart.service';
import { WishlistService } from '@/shared/services/wishlist.service';
import { Router } from '@angular/router';
import { UtilsService } from '@/shared/services/utils.service';
import { NotificationService } from '@/shared/services/notification.service';
import { NotificationSidebarService } from '@/shared/services/notification-sidebar.service';
import { ProfileService, UserProfile } from '@/shared/components/product-details-com/Service/profile.service';
import { IProduct } from '@/types/product-type';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss'],
  standalone: false
})
export class HeaderOneComponent {
  public wishlistItems$: Observable<IProduct[]>;
  public headerSticky: boolean = false;
  public isSidebarOpen$: Observable<boolean>;
  public profile: UserProfile | null = null;
  public isLoading: boolean = false;
  public error: string | null = null;
  public cacheBuster: number = Date.now(); // For cache busting on image update

  constructor(
    public cartService: CartService,
    public wishlistService: WishlistService,
    public utilsService: UtilsService,
    public notificationService: NotificationService,
    public notificationSidebarService: NotificationSidebarService,
    private profileService: ProfileService,
    private router: Router
  ) {
    this.wishlistItems$ = this.wishlistService.getWishlistUpdates();
    this.isSidebarOpen$ = this.notificationSidebarService.getSidebarState();
    // NotificationService.fetchNotifications is already called in its constructor;
    // calling again here would just duplicate the network fire on every page load.
  }

  ngOnInit(): void {
    this.profileService.profile$.subscribe(profile => {
      this.profile = profile;
      this.cacheBuster = Date.now();
    });
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.profile = null;
      this.profileService.clearProfile();
      return;
    }
    this.isLoading = true;
    this.profileService.refreshProfile().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error fetching profile: ' + err.message;
        this.isLoading = false;
        this.profile = null;
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onscroll() {
    if (window.scrollY > 80) {
      this.headerSticky = true;
    } else {
      this.headerSticky = false;
    }
  }

  handleProfileClick() {
    if (this.profile) {
      this.router.navigate(['/pages/profile']);
    } else {
      this.router.navigate(['/pages/login']);
    }
  }

  // Returns the profile image URL if set, otherwise empty string (UI shows initials instead).
  getProfileImageUrl(): string {
    return this.profile?.profileImageUrl
      ? `${this.profile.profileImageUrl}?cb=${this.cacheBuster}`
      : '';
  }

  getInitials(): string {
    const first = this.profile?.firstname?.trim()?.[0] || '';
    const last = this.profile?.lastname?.trim()?.[0] || '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || (this.profile?.email?.[0]?.toUpperCase() ?? 'U');
  }
}
