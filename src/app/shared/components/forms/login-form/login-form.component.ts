import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@/shared/services/auth.service';
import { Router } from '@angular/router';
import { landingForRole } from '@/shared/utils/role-landing';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: false
})
export class LoginFormComponent implements OnInit {
  isShowPass = false;
  public loginForm!: FormGroup;
  public formSubmitted = false;

  constructor(
    private toastrService: ToastrService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }

  handleShowPass() {
    this.isShowPass = !this.isShowPass;
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.auth.login({ email, password }).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.toastrService.success(res.message || 'Login successful!');
            this.loginForm.reset();
            this.formSubmitted = false;
            const landing = landingForRole(this.auth.getRole());
            this.router.navigateByUrl(landing).then(success => {
              if (!success) {
                this.toastrService.error('Failed to redirect. Please try again.');
              }
            }).catch(() => {
              this.toastrService.error('Navigation error. Please try again.');
            });
          } else {
            this.toastrService.error(res.message || 'Login failed');
          }
        },
        error: err => {
          this.toastrService.error(err?.error?.message || 'Login failed');
        }
      });
    } else {
      this.toastrService.error('Please fill in all required fields correctly.');
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
