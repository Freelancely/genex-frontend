import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../Services/order.service';
import { BillingInfoService } from '../../Services/billing-info.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/shared/services/auth.service';

interface BillingInfo {
  billingInfoId: string | null;
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  address: string;
  landMark: string;
  label: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

type PaymentVerificationStatus = 'Verified' | 'ManuallyVerified' | 'Pending' | 'NotApplicable';

interface Order {
  orderId: string;
  orderNo: string;
  fullName: string;
  email: string;
  phone: string;
  orderDateTime: string;
  amountBeforeDiscount: number;
  appliedCouponCode: string | null;
  couponDiscountPercent: number | null;
  amountAfterDiscount: number;
  status: string;
  paymentMethod: string;
  paymentReferenceNumber?: string | null;
  paymentTransactionId?: string | null;
  fonepayTransactionUid?: string | null;
  paymentProcessedAt?: string | null;
  paymentManuallyVerified?: boolean;
  paymentManuallyVerifiedAt?: string | null;
  paymentVerificationStatus?: PaymentVerificationStatus;
  billingInfoId?: string | null;
  billingInfo?: BillingInfo | null;
  orderItems: OrderItem[];
}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  errorMessage = '';
  showStatusModal = false;
  showDeleteModal = false;
  showItemsModal = false;
  showUserModal = false;
  showPaymentModal = false;
  selectedOrder: Order | null = null;
  selectedBillingInfo: BillingInfo | null = null;
  billingInfoLoading = false;
  selectedOrderId: string | null = null;
  orderStatuses = ['Placed', 'Confirmed', 'Dispatched', 'Cancelled', 'Returned', 'Completed'];

  currentRole = '';

  constructor(
    private orderService: OrderService,
    private billingInfoService: BillingInfoService,
    private toastrService: ToastrService,
    private authService: AuthService
  ) {
    this.currentRole = this.authService.getRole();
  }

  get isAccountant(): boolean {
    return this.currentRole === 'Accountant';
  }

  get canManageOrderStatus(): boolean {
    return this.currentRole === 'SuperAdmin' || this.currentRole === 'Admin';
  }

  get canMarkPaymentVerified(): boolean {
    return ['SuperAdmin', 'Admin', 'Accountant'].includes(this.currentRole);
  }

  canShowMarkVerified(order: Order): boolean {
    if (!this.canMarkPaymentVerified) return false;
    const status = order.paymentVerificationStatus;
    return status !== 'Verified' && status !== 'ManuallyVerified' && status !== 'NotApplicable';
  }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService.getOrders(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          if (typeof response.message !== 'string') {
            this.orders = response.message.items;
            this.totalCount = response.message.totalCount;
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);
            this.errorMessage = '';
          } else {
            this.errorMessage = 'Unexpected response format';
            this.toastrService.error(this.errorMessage);
          }
        } else {
          this.errorMessage = typeof response.message === 'string' ? response.message : 'Failed to fetch orders';
          this.toastrService.error(this.errorMessage);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch orders';
        this.toastrService.error('Error fetching orders');
        console.error('fetchOrders Error:', err);
      }
    });
  }

  getStatusClass(status: string): string {
    return status;
  }

  changePage(page: number) {
    this.pageNumber = page;
    this.fetchOrders();
  }

  openItemsModal(order: Order) {
    this.selectedOrder = { ...order };
    this.showItemsModal = true;
  }

  closeItemsModal() {
    this.showItemsModal = false;
    this.selectedOrder = null;
  }

  openUserModal(order: Order) {
    this.selectedOrder = { ...order };
    this.selectedBillingInfo = null;
    this.billingInfoLoading = true;
    this.showUserModal = true;

    if (order.billingInfo) {
      this.selectedBillingInfo = this.normalizeBillingInfo(order.billingInfo);
      this.billingInfoLoading = false;
    } else if (order.billingInfoId) {
      this.billingInfoService.getBillingInfoById(order.billingInfoId).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedBillingInfo = this.normalizeBillingInfo(response.message as any);
          } else {
            this.toastrService.error('Unable to load billing info');
          }
          this.billingInfoLoading = false;
        },
        error: (err) => {
          console.error('Error loading billing info:', err);
          this.toastrService.error('Unable to load billing info');
          this.billingInfoLoading = false;
        }
      });
    } else {
      this.billingInfoLoading = false;
    }
  }

  private normalizeBillingInfo(info: any): BillingInfo {
    return {
      billingInfoId: info.billingInfoId ?? null,
      fullName: info.fullName ?? '',
      phoneNumber: info.phoneNumber ?? info.phoneNUmber ?? '',
      province: info.province ?? '',
      city: info.city ?? '',
      address: info.address ?? '',
      landMark: info.landMark ?? '',
      label: info.label ?? ''
    };
  }

  closeUserModal() {
    this.showUserModal = false;
    this.selectedOrder = null;
    this.selectedBillingInfo = null;
    this.billingInfoLoading = false;
  }

  openStatusModal(order: Order) {
  if (order) {
    this.selectedOrder = { ...order };
    this.showStatusModal = true;
  } else {
    this.toastrService.error('No valid order selected');
  }
}

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedOrder = null;
    this.fetchOrders();
  }

  confirmStatusChange() {
    if (this.selectedOrder) {
      const statusIndex = this.orderStatuses.indexOf(this.selectedOrder.status);
      this.orderService.changeOrderStatus(this.selectedOrder.orderId, statusIndex).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastrService.success(response.message);
            this.fetchOrders();
          } else {
            this.toastrService.error(response.message);
          }
        },
        error: (err) => {
          this.toastrService.error('Error changing order status');
          console.error('changeOrderStatus Error:', err);
        }
      });
    }
    this.showStatusModal = false;
    this.selectedOrder = null;
  }

  openDeleteModal(order: Order) {
    this.selectedOrderId = order.orderId;
    this.selectedOrder = order;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedOrderId = null;
  }

  confirmDelete() {
    if (this.selectedOrderId) {
      this.orderService.changeOrderStatus(this.selectedOrderId, 3).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastrService.success(response.message);
            this.fetchOrders();
          } else {
            this.toastrService.error(response.message);
          }
        },
        error: (err) => {
          this.toastrService.error('Error cancelling order');
          console.error('cancelOrder Error:', err);
        }
      });
    }
    this.closeDeleteModal();
  }

  openPaymentModal(order: Order) {
    this.selectedOrder = { ...order };
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedOrder = null;
  }

  copyToClipboard(value: string | null | undefined) {
    if (!value) return;
    navigator.clipboard.writeText(value).then(
      () => this.toastrService.success('Copied to clipboard'),
      () => this.toastrService.error('Copy failed')
    );
  }

  paymentStatusLabel(status: PaymentVerificationStatus | undefined): string {
    switch (status) {
      case 'Verified': return 'Verified (Fonepay)';
      case 'ManuallyVerified': return 'Manually Verified';
      case 'NotApplicable': return 'N/A (Cash)';
      case 'Pending':
      default: return 'Pending';
    }
  }

  markPaymentVerified(order: Order) {
    if (!confirm(`Mark payment as manually verified for order ${order.orderNo}?`)) return;

    this.orderService.markPaymentVerified(order.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastrService.success(response.message || 'Payment marked verified');
          this.fetchOrders();
        } else {
          this.toastrService.error(response.message || 'Failed to mark verified');
        }
      },
      error: (err) => {
        this.toastrService.error(err.error?.message || 'Failed to mark verified');
        console.error('markPaymentVerified Error:', err);
      }
    });
  }
}
