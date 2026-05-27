import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Inquiry, InquiryService } from '../Services/inquiry.service';

@Component({
  selector: 'app-inquiries',
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class InquiriesComponent implements OnInit {
  inquiries: Inquiry[] = [];
  loading = false;
  errorMessage = '';

  showMessageModal = false;
  showDeleteModal = false;
  selected: Inquiry | null = null;

  constructor(
    private inquiryService: InquiryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.inquiryService.getAll().subscribe({
      next: (res) => {
        this.inquiries = res.success ? res.data : [];
        this.errorMessage = res.success ? '' : 'Failed to load inquiries';
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load inquiries';
        this.toastr.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  openMessage(inquiry: Inquiry): void {
    this.selected = inquiry;
    this.showMessageModal = true;

    if (!inquiry.isRead) {
      this.inquiryService.markRead(inquiry.id).subscribe({
        next: () => {
          inquiry.isRead = true;
        },
        error: () => {
          // silent — viewing should still work even if mark-read fails
        }
      });
    }
  }

  closeMessage(): void {
    this.showMessageModal = false;
    this.selected = null;
  }

  openDelete(inquiry: Inquiry): void {
    this.selected = inquiry;
    this.showDeleteModal = true;
  }

  closeDelete(): void {
    this.showDeleteModal = false;
    this.selected = null;
  }

  confirmDelete(): void {
    if (!this.selected) return;
    const id = this.selected.id;
    this.inquiryService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.inquiries = this.inquiries.filter(i => i.id !== id);
          this.toastr.success('Inquiry deleted');
        } else {
          this.toastr.error(res.message || 'Delete failed');
        }
        this.closeDelete();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Delete failed');
        this.closeDelete();
      }
    });
  }
}
