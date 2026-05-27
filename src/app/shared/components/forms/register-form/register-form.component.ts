import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@/shared/services/auth.service';
import { Router } from '@angular/router'; // Import Router

@Component({
    selector: 'app-register-form',
    templateUrl: './register-form.component.html',
    styleUrls: ['./register-form.component.scss'],
    standalone: false
})
export class RegisterFormComponent implements OnInit {

  isShowPass = false;
  public registerForm!: FormGroup;
  public formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private auth: AuthService,
    private router: Router // Inject Router
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: [''],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      this.auth.register(formValue).subscribe({
        next: () => {
          this.toastrService.success('Registration successful! Please check your email to verify your account.');
          this.registerForm.reset();
          this.formSubmitted = false;
          // Navigate to the login page
          this.router.navigateByUrl('/pages/login');
        },
        error: err => {
          this.toastrService.error(err?.error?.message || 'Registration failed');
        }
      });
    }
  }

  get firstname() { return this.registerForm.get('firstname'); }
  get lastname() { return this.registerForm.get('lastname'); }
  get address() { return this.registerForm.get('address'); }
  get email() { return this.registerForm.get('email'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}
