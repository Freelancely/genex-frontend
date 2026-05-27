import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './Admin/Layout/layout/layout.component';
import { UserLayoutComponent } from './Admin/Layout/user-layout/user-layout.component';
import { DashboardComponent } from './Admin/dashboard/dashboard.component';
import { ProductsComponent } from './Admin/products/products.component';
import { AboutComponent } from './about/about.component';
import { BlogComponent } from './blog/blog/blog.component';
import { ContactComponent } from './contact/contact.component';
import { BlogGridComponent } from './blog/blog-grid/blog-grid.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogDetailsComponent } from './blog/blog-details/blog-details.component';
import { DynamicBlogDetailsComponent } from './blog/dynamic-blog-details/dynamic-blog-details.component';
import { CouponComponent } from './coupon/coupon.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchComponent } from './search/search.component';
import { CategoriesComponent } from './Admin/Product/Category/categories/categories.component';
import { SubCategoryProductsComponent } from './Admin/Product/Sub-Category/sub-category-products/sub-category-products.component';
import { AddSubCategoryComponent } from './Admin/Product/Sub-Category/add-sub-category/add-sub-category.component';
import { AddCouponComponent } from './Admin/add-coupon/add-coupon.component';
import { ViewCouponsComponent } from './Admin/view-coupons/view-coupons.component';
import { ShopComponent } from '../shop/pages/shop/shop.component';
import { ElectronicsComponent } from '../home/electronics/electronics.component';
import { BannerComponent } from './Admin/Product/banner/banner.component';
import { BannerListComponent } from './Admin/Product/banner-list/banner-list.component';
import { OrderListComponent } from './Admin/Product/order-list/order-list.component';
import { Users } from 'lucide-angular';
import { UsersComponent } from './Admin/users/users.component';
import { EditProductComponent } from './Admin/Product/edit-product/edit-product.component';
import { DiscountsComponent } from './Admin/Product/discounts/discounts.component';
import { ViewDiscountsComponent } from './Admin/Product/view-discounts/view-discounts.component';
import { ConfirmEmailComponent } from '@/shared/components/forms/confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentFailedComponent } from './payment-failed/payment-failed.component';
import { ManageAdminsComponent } from './Admin/manage-admins/manage-admins.component';
import { InquiriesComponent } from './Admin/inquiries/inquiries.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsComponent } from './terms/terms.component';
import { ShippingComponent } from './shipping/shipping.component';
import { ReturnsComponent } from './returns/returns.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'home', component: ElectronicsComponent, title: 'Home Page' },
      { path: 'shop', component: ShopComponent, title: 'Shop Page' },
      { path: 'coupons', component: CouponComponent, title: 'Coupon Page' },
      { path: 'contact', component: ContactComponent, title: 'Contact Page' },
      { path: 'about', component: AboutComponent, title: 'About Page' },
      { path: 'blog', component: BlogComponent, title: 'Blog Page' },
      { path: 'blog-grid', component: BlogGridComponent, title: 'Blog Grid Page' },
      { path: 'blog-list', component: BlogListComponent, title: 'Blog List Page' },
      { path: 'blog-details', component: BlogDetailsComponent, title: 'Blog Details Page' },
      { path: 'blog-details/:id', component: DynamicBlogDetailsComponent, title: 'Blog Details Page' },
      { path: 'login', component: LoginComponent, title: 'Login Page' },
      { path: 'register', component: RegisterComponent, title: 'Register Page' },
      { path: 'forgot', component: ForgotPasswordComponent, title: 'Forgot Page' },
      { path: 'checkout', component: CheckoutComponent, title: 'Checkout Page' },
      { path: 'profile', component: ProfileComponent, title: 'Profile Page' },
      { path: 'search', component: SearchComponent, title: 'Search Page' },
      { path: 'confirm-email', component: ConfirmEmailComponent, title: 'Confirm Email Page' },
      { path: 'reset-password', component: ResetPasswordComponent, title: 'Reset Password Page' },
      { path: 'payment-success', component: PaymentSuccessComponent, title: 'Payment Success' },
      { path: 'payment-failed', component: PaymentFailedComponent, title: 'Payment Failed' },
      { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Privacy Policy' },
      { path: 'terms', component: TermsComponent, title: 'Terms & Conditions' },
      { path: 'shipping', component: ShippingComponent, title: 'Shipping Policy' },
      { path: 'returns', component: ReturnsComponent, title: 'Returns & Refunds' },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard Page',
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper', 'Accountant', 'Receptionist'] } },
      { path: 'products', component: ProductsComponent, title: 'Products Page',
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] } },
      { path: 'categories', component: CategoriesComponent, title: 'Category Page',
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] } },
      { path: 'add-sub-category', component: AddSubCategoryComponent, title: 'Sub Category Page',
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] } },
      { path: 'add-coupon', component: AddCouponComponent, title: 'Add Coupon Page',
        data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'view-coupons', component: ViewCouponsComponent, title: 'Coupon Page',
        data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'banner', component: BannerComponent, title: 'Banner Page',
        data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'banner-list', component: BannerListComponent, title: 'View Banners Page',
        data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'order-list', component: OrderListComponent, title: 'View Orders Page',
        data: { roles: ['SuperAdmin', 'Admin', 'Accountant'] } },
      { path: 'users-list', component: UsersComponent, title: 'View Users Page',
        data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'manage-admins', component: ManageAdminsComponent, title: 'Manage Admins',
        data: { roles: ['SuperAdmin'] } },
      { path: 'add-discount', component: DiscountsComponent, title: 'Add Discounts Page',
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] } },
      { path: 'discount-list', component: ViewDiscountsComponent, title: 'View Discounts Page',
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] } },
      { path: 'inquiries', component: InquiriesComponent, title: 'Inquiries',
        data: { roles: ['SuperAdmin', 'Admin', 'Receptionist'] } },
      { path: 'add-product/:subCategoryId', component: ProductsComponent,
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] } },
      { path: 'edit-product/:id', component: EditProductComponent,
        data: { roles: ['SuperAdmin', 'Admin', 'StoreKeeper'] } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
