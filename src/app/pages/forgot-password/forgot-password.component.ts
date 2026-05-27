import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup,Validators } from '@angular/forms';
import { AuthService } from '@/shared/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    standalone: false
})
export class ForgotPasswordComponent {

  public forgotForm!: FormGroup;
  public formSubmitted = false;

  constructor(private toastrService: ToastrService, private auth: AuthService) { }

  ngOnInit () {
    this.forgotForm = new FormGroup({
      email:new FormControl(null,[Validators.required,Validators.email])
    })
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.forgotForm.valid) {
      this.auth.forgotPassword({ email: this.forgotForm.value.email }).subscribe({
        next: () => {
          this.toastrService.success('Password reset link sent!');
          this.forgotForm.reset();
          this.formSubmitted = false;
        },
        error: err => {
          this.toastrService.error(err?.error?.message || 'Failed to send reset link');
        }
      });
    }
  }

  get email() { return this.forgotForm.get('email') }
}
