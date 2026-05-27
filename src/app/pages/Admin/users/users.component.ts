import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../Services/users.service';
import * as XLSX from 'xlsx';

interface User {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  phoneNumber: string;
  role?: string;
  isBanned: boolean;
}

type ActionType = 'disable' | 'restore' | 'permanent';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  errorMessage = '';

  showModal = false;
  modalType: ActionType | null = null;
  selectedUserId: string | null = null;
  selectedUserEmail: string | null = null;
  isSubmitting = false;

  constructor(
    private usersService: UsersService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.usersService.getUsers(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          if (typeof response.message !== 'string' && response.message?.items) {
            this.users = response.message.items;
            this.totalCount = response.message.totalCount ?? 0;
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);
            this.errorMessage = '';
          } else {
            this.errorMessage = 'Unexpected response format';
            this.toastrService.error(this.errorMessage);
          }
        } else {
          this.errorMessage = 'Failed to fetch users';
          this.toastrService.error(this.errorMessage);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch users';
        this.toastrService.error('Error fetching users');
        console.error('fetchUsers Error:', err);
      }
    });
  }

  openConfirmModal(user: User, type: ActionType) {
    this.selectedUserId = user.userId;
    this.selectedUserEmail = user.email;
    this.modalType = type;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.modalType = null;
    this.selectedUserId = null;
    this.selectedUserEmail = null;
    this.isSubmitting = false;
  }

  modalTitle(): string {
    if (this.modalType === 'disable') return 'Disable user';
    if (this.modalType === 'restore') return 'Restore user';
    return 'Permanently delete user';
  }

  modalMessage(): string {
    if (this.modalType === 'disable') {
      return `Disabled users cannot log in. ${this.selectedUserEmail ?? 'This user'} can be restored later.`;
    }
    if (this.modalType === 'restore') {
      return `Restore ${this.selectedUserEmail ?? 'this user'}? They will be able to log in again.`;
    }
    return `Permanently delete ${this.selectedUserEmail ?? 'this user'}? This cannot be undone.`;
  }

  confirmLabel(): string {
    if (this.modalType === 'disable') return 'Disable';
    if (this.modalType === 'restore') return 'Restore';
    return 'Delete';
  }

  confirmClass(): string {
    if (this.modalType === 'restore') return 'confirm restore';
    if (this.modalType === 'permanent') return 'confirm permanent';
    return 'confirm disable';
  }

  confirmAction() {
    if (!this.selectedUserId || !this.modalType) return;
    const type = this.modalType;

    const request$ = type === 'disable'
      ? this.usersService.disableUser(this.selectedUserId)
      : type === 'restore'
        ? this.usersService.restoreUser(this.selectedUserId)
        : this.usersService.deleteUser(this.selectedUserId);

    this.isSubmitting = true;

    request$.subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && typeof response.message === 'string') {
          this.toastrService.success(response.message);
          this.fetchUsers();
        } else {
          this.toastrService.error(`Failed to ${type} user`);
        }
        this.closeModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        const apiMessage = err?.error?.message;
        this.toastrService.error(apiMessage || `Error ${type === 'disable' ? 'disabling' : type === 'restore' ? 'restoring' : 'deleting'} user`);
        this.closeModal();
      }
    });
  }

  exportToExcel() {
    const worksheetData = this.users.map(user => ({
      'User ID': user.userId,
      'First Name': user.firstname,
      'Last Name': user.lastname,
      Email: user.email,
      Address: user.address,
      'Phone Number': user.phoneNumber,
      Role: user.role || '',
      Status: user.isBanned ? 'Disabled' : 'Active'
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `Users_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  changePage(page: number) {
    this.pageNumber = page;
    this.fetchUsers();
  }
}
