import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: false
})
export class ResetPasswordComponent implements OnInit {
  public resetForm!: FormGroup;
  public formSubmitted = false;
  private token: string | null = null;

  constructor(
    private toastrService: ToastrService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Extract token from URL query parameter
    this.route.queryParams.subscribe(params => {
      this.token = params['data'] || null;
    });

    // Initialize form with validation
    this.resetForm = new FormGroup({
      newPassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/)
      ]),
      confirmPassword: new FormControl(null, [Validators.required])
    }, { validators: this.passwordMatchValidator() });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const form = control as FormGroup;
      const newPassword = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return newPassword === confirmPassword ? null : { mismatch: true };
    };
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.resetForm.valid && this.token) {
      const resetData = {
        data: this.token,
        newPassword: this.resetForm.value.newPassword,
        confirmPassword: this.resetForm.value.confirmPassword
      };

      this.auth.resetPassword(resetData).subscribe({
        next: () => {
          this.toastrService.success('Password reset successfully!');
          this.resetForm.reset();
          this.formSubmitted = false;
          this.router.navigate(['/pages/login']);
        },
        error: err => {
          const errorMessage = err?.error?.message || 'Failed to reset password';
          const errorDetails = err?.error?.errors ? err.error.errors.join('; ') : '';
          this.toastrService.error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
        }
      });
    } else if (!this.token) {
      this.toastrService.error('Invalid or missing reset token');
    }
  }

  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }
}
