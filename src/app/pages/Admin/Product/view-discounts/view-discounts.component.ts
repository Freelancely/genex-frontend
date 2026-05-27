// src/app/view-discounts/view-discounts.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DiscountsService, Discount, Message } from '../../Services/discounts.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-view-discounts',
  templateUrl: './view-discounts.component.html',
  styleUrls: ['./view-discounts.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class ViewDiscountsComponent implements OnInit {
  discounts: Discount[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  errorMessage = '';
  showDeleteModal = false;
  selectedDiscountId: string | null = null;

  constructor(
    private discountsService: DiscountsService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchDiscounts();
  }

  fetchDiscounts() {
    this.discountsService.getAllDiscounts(this.pageNumber, this.pageSize).subscribe({
      next: (response: Message) => {
        if (response.success && response.data.items) {
          this.discounts = response.data.items.map(discount => ({
            discountId: discount.discountId,
            discountPercentage: discount.discountPercentage,
            validFrom: discount.validFrom,
            validTill: discount.validTill
          }));
          this.totalCount = response.data.totalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Unexpected response format';
          this.toastrService.error(this.errorMessage);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch discounts';
        this.toastrService.error('Error fetching discounts');
        console.error('fetchDiscounts Error:', err);
      }
    });
  }

  openConfirmModal(discountId: string | undefined) {
    if (!discountId) {
      this.toastrService.error('Cannot delete discount: ID is missing');
      return;
    }
    this.selectedDiscountId = discountId;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showDeleteModal = false;
    this.selectedDiscountId = null;
  }

  confirmDelete() {
    if (!this.selectedDiscountId) return;

    this.discountsService.deleteDiscount(this.selectedDiscountId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastrService.success('Discount deleted successfully');
          this.discounts = this.discounts.filter(
            (discount) => discount.discountId !== this.selectedDiscountId
          );
          this.totalCount--;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.closeModal();
          this.cdr.detectChanges();
        } else {
          this.toastrService.error('Failed to delete discount');
          this.closeModal();
        }
      },
      error: (err) => {
        this.toastrService.error('Error deleting discount');
        console.error('deleteDiscount Error:', err);
        this.closeModal();
      }
    });
  }

  exportToExcel() {
    const worksheetData = this.discounts.map(discount => ({
      'Discount Percentage': discount.discountPercentage,
      'Valid From': new Date(discount.validFrom).toISOString(),
      'Valid Till': new Date(discount.validTill).toISOString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Discounts');
    XLSX.writeFile(workbook, `Discounts_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  changePage(page: number) {
    this.pageNumber = page;
    this.fetchDiscounts();
  }
}
