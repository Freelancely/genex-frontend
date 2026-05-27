import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminManagementService, AdminUser, CreateAdminPayload } from '../Services/admin-management.service';
import { AuthService } from '@/shared/services/auth.service';

@Component({
  selector: 'app-manage-admins',
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ManageAdminsComponent implements OnInit {
  admins: AdminUser[] = [];
  loading = false;
  submitting = false;
  showForm = false;

  form: CreateAdminPayload = {
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    role: 'Admin'
  };

  assignableRoles: Array<{ value: CreateAdminPayload['role']; label: string }> = [
    { value: 'Admin', label: 'Admin' },
    { value: 'StoreKeeper', label: 'Store Keeper' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Receptionist', label: 'Receptionist' }
  ];

  constructor(
    private adminService: AdminManagementService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isSuperAdmin()) {
      this.toastr.error('Only the SuperAdmin can manage admins.', 'Access denied');
      this.router.navigate(['/pages/admin/dashboard']);
      return;
    }

    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.adminService.listAdmins().subscribe({
      next: (response) => {
        this.admins = response.success ? response.message : [];
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to load admins', 'Error');
        this.loading = false;
      }
    });
  }

  openForm(): void {
    this.showForm = true;
    this.resetForm();
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      firstname: '',
      lastname: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      role: 'Admin'
    };
  }

  submit(formRef: NgForm): void {
    if (formRef.invalid) {
      this.toastr.error('Please fill in all required fields.', 'Invalid form');
      return;
    }

    this.submitting = true;
    this.adminService.addAdmin(this.form).subscribe({
      next: (response) => {
        this.toastr.success('Admin added successfully.', 'Success');
        this.admins.unshift(response.message);
        this.closeForm();
        this.submitting = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to add admin', 'Error');
        this.submitting = false;
      }
    });
  }

  remove(admin: AdminUser): void {
    if (admin.role === 'SuperAdmin') {
      this.toastr.warning('SuperAdmin cannot be removed.', 'Not allowed');
      return;
    }

    if (!confirm(`Remove admin ${admin.email}?`)) return;

    this.adminService.removeAdmin(admin.userId).subscribe({
      next: () => {
        this.toastr.success('Admin removed.', 'Success');
        this.admins = this.admins.filter(a => a.userId !== admin.userId);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to remove admin', 'Error');
      }
    });
  }
}
