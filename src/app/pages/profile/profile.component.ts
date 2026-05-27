import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, Order, UserProfile } from '@/shared/components/product-details-com/Service/profile.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { AuthService } from '@/shared/services/auth.service';
import { landingForRole } from '@/shared/utils/role-landing';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit, AfterViewInit {
  public genderSelectOptions = [
    { value: 'male', text: 'Male' },
    { value: 'female', text: 'Female' },
    { value: 'others', text: 'Others' },
  ];

  orders: Order[] = [];
  profile: UserProfile | null = null;
  isLoading = false;
  error: string | null = null;
  userId: string | null = null;
  selectedImage: File | null = null;
  profileImagePreview: string | null = null;
  cacheBuster: number = Date.now();
  isCustomer = false;

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
    this.isCustomer = !this.authService.isAdminLike() && !!this.userId;

    if (this.authService.isAdminLike()) {
      const landing = landingForRole(this.authService.getRole());
      this.toastr.info('Admins use the admin panel — redirecting.', 'Redirecting');
      this.router.navigateByUrl(landing);
      return;
    }

    if (this.userId) {
      this.loadOrders();
      this.loadProfile();
    } else {
      this.error = 'User not logged in';
    }
  }

  ngAfterViewInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (!tab) return;
      const map: Record<string, string> = {
        profile: 'nav-profile-tab',
        information: 'nav-information-tab',
        orders: 'nav-order-tab',
        password: 'nav-password-tab',
      };
      const targetId = map[tab];
      if (!targetId) return;
      setTimeout(() => {
        const btn = document.getElementById(targetId) as HTMLButtonElement | null;
        if (btn) btn.click();
      }, 0);
    });
  }

  loadOrders(): void {
    if (!this.userId) {
      this.error = 'User not logged in';
      return;
    }
    this.isLoading = true;
    this.profileService.getUserOrders(this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.message;
        } else {
          this.error = 'Failed to load orders';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error fetching orders: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.refreshProfile().subscribe({
      next: (response) => {
        this.profile = this.normalizeProfile(response);
        this.isLoading = false;
        this.cacheBuster = Date.now();
      },
      error: (err) => {
        this.error = 'Error fetching profile: ' + (err?.message || 'Unknown error');
        this.profile = this.emptyProfile();
        this.isLoading = false;
      }
    });
  }

  private normalizeProfile(response: any): UserProfile {
    if (!response) return this.emptyProfile();
    return {
      firstname: response.firstname ?? response.Firstname ?? '',
      lastname: response.lastname ?? response.Lastname ?? '',
      email: response.email ?? response.Email ?? '',
      address: response.address ?? response.Address ?? '',
      phoneNumber: response.phoneNumber ?? response.PhoneNumber ?? '',
      role: response.role ?? response.Role ?? '',
      profileImageUrl: response.profileImageUrl ?? response.ProfileImageUrl ?? ''
    };
  }

  private emptyProfile(): UserProfile {
    return {
      firstname: '',
      lastname: '',
      email: '',
      address: '',
      phoneNumber: '',
      role: '',
      profileImageUrl: ''
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Only PNG, JPG or WEBP images are allowed', 'Invalid file');
      input.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastr.error('Image must be smaller than 5MB', 'File too large');
      input.value = '';
      return;
    }

    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  cancelImageSelection(): void {
    this.selectedImage = null;
    this.profileImagePreview = null;
  }

  getInitials(): string {
    const first = this.profile?.firstname?.trim()?.[0] || '';
    const last = this.profile?.lastname?.trim()?.[0] || '';
    const initials = `${first}${last}`.toUpperCase();
    if (initials) return initials;
    const email = this.profile?.email || localStorage.getItem('email') || '';
    return email ? email[0].toUpperCase() : 'U';
  }

  getDisplayName(): string {
    const first = this.profile?.firstname?.trim() || '';
    const last = this.profile?.lastname?.trim() || '';
    const fullName = `${first} ${last}`.trim();
    if (fullName) return fullName;
    const email = this.profile?.email || localStorage.getItem('email') || '';
    if (email) return email.split('@')[0];
    return 'there';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  updateProfile(imageOnly: boolean = false): void {
    if (imageOnly && !this.selectedImage) {
      this.toastr.error('No image selected', 'Error');
      return;
    }

    if (!imageOnly && !this.profile) {
      this.toastr.error('No profile data to update', 'Error');
      return;
    }

    this.isLoading = true;
    const request = imageOnly
      ? this.profileService.updateProfileImage(this.selectedImage!)
      : this.profileService.updateProfile(this.profile!, this.selectedImage);

    request.subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success(response.message, 'Success');
          this.selectedImage = null;
          this.profileImagePreview = null;
          this.loadProfile();
        } else {
          this.toastr.error('Failed to update profile', 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Error updating profile: ' + err.message, 'Error');
        this.isLoading = false;
      }
    });
  }

  changePassword(form: NgForm): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastr.error('Passwords do not match', 'Error');
      return;
    }

    this.isLoading = true;
    this.profileService.changePassword(this.passwordData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Password updated successfully', 'Success');
          form.resetForm();
          this.passwordData = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        } else {
          this.toastr.error(response.message || 'Failed to update password', 'Error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error?.message || 'Error updating password', 'Error');
      }
    });
  }

  updateProfileImage(): void {
    this.updateProfile(true);
  }

  changeHandler(selectedOption: { value: string; text: string }) {
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/pages/login']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDisplayOrderNumber(order: Order): string {
    if (order.orderNumber) {
      return order.orderNumber;
    }
    return this.shortId(order.orderId);
  }

  shortId(id: string | undefined | null): string {
    if (!id) return '';
    const stripped = id.replace(/-/g, '');
    return stripped.length > 8 ? stripped.substring(0, 8).toUpperCase() : stripped.toUpperCase();
  }

  statusClass(status: string | undefined | null): string {
    switch ((status || '').toLowerCase()) {
      case 'placed': return 'status-placed';
      case 'confirmed': return 'status-confirmed';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled':
      case 'canceled': return 'status-cancelled';
      case 'failed': return 'status-failed';
      default: return 'status-default';
    }
  }

  getProfileImageUrl(): string {
    return this.profile?.profileImageUrl
      ? `${this.profile.profileImageUrl}?cb=${this.cacheBuster}`
      : '';
  }

  editProfile(form?: NgForm): void {
    if (form && form.invalid) {
      this.toastr.error('Please fill in all required fields correctly', 'Invalid form');
      return;
    }
    this.updateProfile(false);
  }
}
