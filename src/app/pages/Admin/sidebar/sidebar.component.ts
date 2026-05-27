import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthService } from '@/shared/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  isOpen?: boolean;
  roles?: string[];
  superAdminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ToastrModule]
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  visibleMenuItems: MenuItem[] = [];

  menuItems: MenuItem[] = [
    {
      icon: 'fas fa-home',
      label: 'Dashboard',
      route: '/pages/admin/dashboard',
      roles: ['SuperAdmin', 'Admin', 'StoreKeeper', 'Accountant', 'Receptionist']
    },
    {
      icon: 'fas fa-shop',
      label: 'Products',
      isOpen: false,
      roles: ['SuperAdmin', 'Admin', 'StoreKeeper'],
      children: [
        { icon: 'fas fa-layer-group', label: 'Brands', route: '/pages/admin/categories',
          roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] },
        { icon: 'fas fa-layer-group', label: 'Categories', route: '/pages/admin/add-sub-category',
          roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] },
        { icon: 'fas fa-layer-group', label: 'Add Products', route: '/pages/admin/products',
          roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] },
      ]
    },
    {
      icon: 'fas fa-cart-shopping',
      label: 'View Orders',
      route: '/pages/admin/order-list',
      roles: ['SuperAdmin', 'Admin', 'Accountant']
    },
    {
      icon: 'fas fa-envelope-open-text',
      label: 'Inquiries',
      route: '/pages/admin/inquiries',
      roles: ['SuperAdmin', 'Admin', 'Receptionist']
    },
    {
      icon: 'fas fa-tags',
      label: 'Discount',
      isOpen: false,
      roles: ['SuperAdmin', 'Admin', 'StoreKeeper'],
      children: [
        { icon: 'fas fa-tag', label: 'Add Discount', route: '/pages/admin/add-discount',
          roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] },
        { icon: 'fas fa-tags', label: 'View Discount', route: '/pages/admin/discount-list',
          roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] }
      ]
    },
    {
      icon: 'fas fa-ticket',
      label: 'Coupon',
      isOpen: false,
      roles: ['SuperAdmin', 'Admin'],
      children: [
        { icon: 'fas fa-layer-group', label: 'Add Coupon', route: '/pages/admin/add-coupon',
          roles: ['SuperAdmin', 'Admin'] },
        { icon: 'fas fa-layer-group', label: 'View Coupons', route: '/pages/admin/view-coupons',
          roles: ['SuperAdmin', 'Admin'] }
      ]
    },
    // {
    //   icon: 'fas fa-signs-post',
    //   label: 'Banner',
    //   isOpen: false,
    //   children: [
    //     { icon: 'fas fa-layer-group', label: 'Add Banners', route: '/pages/admin/banner' },
    //     { icon: 'fas fa-layer-group', label: 'View Banners', route: '/pages/admin/banner-list' }
    //   ]
    // },
    {
      icon: 'fas fa-users',
      label: 'View Users',
      route: '/pages/admin/users-list',
      roles: ['SuperAdmin', 'Admin']
    },
    {
      icon: 'fas fa-user-shield',
      label: 'Manage Admins',
      route: '/pages/admin/manage-admins',
      superAdminOnly: true
    },
    {
      icon: 'fas fa-tv',
      label: 'Visit Website',
      route: '/home/electronic'
    }
  ];

  constructor(private router: Router, private toastr: ToastrService, private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    const isSuperAdmin = role === 'SuperAdmin';

    const isVisible = (item: MenuItem): boolean => {
      if (item.superAdminOnly && !isSuperAdmin) return false;
      if (item.roles && item.roles.length > 0 && !item.roles.includes(role)) return false;
      return true;
    };

    this.visibleMenuItems = this.menuItems
      .filter(isVisible)
      .map(item => {
        if (!item.children) return item;
        const visibleChildren = item.children.filter(isVisible);
        return { ...item, children: visibleChildren };
      })
      .filter(item => !item.children || item.children.length > 0 || !!item.route);
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleMenuItem(item: MenuItem) {
    if (!this.isSidebarCollapsed && item.children) {
      item.isOpen = !item.isOpen;
    }
  }

  onLogout() {
    this.toastr.success('Logged out successfully!', 'Success');
    localStorage.clear();
    this.logout.emit();
    this.router.navigate(['/pages/login']);
  }
}
