import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

interface Banner {
  bannerId: string;
  hyperlink: string | null;
  imageUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: T;
}

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-list.component.html',
  styleUrls: ['./banner-list.component.scss'],
})
export class BannerListComponent {
  private http = inject(HttpClient);
  // private readonly apiBaseUrl = 'http://localhost:5177/api/banner';
  private readonly apiBaseUrl = environment.apiUrl;

  tabs = ['All', 'GeneX', 'Polytron', 'Chunlan'] as const;
  activeTab = signal<string>('All');
  banners = signal<Banner[]>([]);
  errorMessage = signal<string | null>(null);
  showDeleteModal = signal(false);
  selectedBannerId = signal<string | null>(null);

  constructor() {
    this.fetchBanners();
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    this.fetchBanners();
  }

  private fetchBanners() {
    const tab = this.activeTab().toLowerCase(); // Use lowercase for API calls
    const url = tab === 'all' ? `${this.apiBaseUrl}banner/all` : `${this.apiBaseUrl}banner/${tab}`;

    this.http
      .get<ApiResponse<Banner[]>>(url)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError('Error fetching banners', error);
          return of({ success: false, message: [] });
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.banners.set(response.message);
            this.errorMessage.set(null);
          } else {
            this.banners.set([]);
            this.errorMessage.set('Failed to fetch banners');
          }
        },
      });
  }

  openDeleteModal(bannerId: string) {
    this.selectedBannerId.set(bannerId);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedBannerId.set(null);
  }

  confirmDelete() {
    const bannerId = this.selectedBannerId();
    if (!bannerId) return;

    this.http
      .delete<ApiResponse<string>>(`${this.apiBaseUrl}banner/${bannerId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError('Error deleting banner', error);
          return of({ success: false, message: 'Deletion failed' });
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.errorMessage.set(response.message);
            this.fetchBanners();
          } else {
            this.errorMessage.set('Failed to delete banner');
          }
          this.closeDeleteModal();
        },
      });
  }

  private handleError(message: string, error: HttpErrorResponse) {
    const errorMsg = `${message}: ${error.message}`;
    this.errorMessage.set(errorMsg);
    console.error(errorMsg, error);
  }
}
